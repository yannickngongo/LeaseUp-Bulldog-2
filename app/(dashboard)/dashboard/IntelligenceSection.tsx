"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiskResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  topDrivers: string[];
  shouldTriggerInterventionMode: boolean;
}

interface DigestResult {
  headline: string;
  recommendedNextMove: string;
  leadsGenerated: number;
  leasesSigned: number;
  avgResponseTimeMin: number;
}

interface ActionItem {
  id: string;
  title: string;
  action_type: string;
  urgency: "low" | "medium" | "high" | "critical";
  reason: string;
}

interface NarrativeResult {
  headline: string;
  explanation: string;
  recommendedAction: string;
  impactLevel: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_STYLES = {
  low:      { bar: "bg-green-500",  badge: "bg-green-100 text-green-700",   label: "Low Risk"      },
  medium:   { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700",   label: "Medium Risk"   },
  high:     { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",       label: "High Risk"     },
  critical: { bar: "bg-red-600",    badge: "bg-red-200 text-red-800",       label: "Critical Risk" },
};

const URGENCY_DOT: Record<string, string> = {
  high: "bg-red-400", critical: "bg-red-600", medium: "bg-amber-400", low: "bg-gray-300",
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  review_handoffs: "Review", strengthen_offer: "Offer", prioritize_leads: "Leads",
  increase_follow_up: "Follow-up", launch_campaign: "Campaign", adjust_messaging: "Messaging",
  human_review: "Manual",
};

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-[#1C1F2E]">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3">{title}</p>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-2 h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
          <span className="text-gray-300 text-sm dark:text-gray-600">✦</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#1C1F2E]">
      <p className="text-xs font-medium text-gray-400 mb-3">{title}</p>
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-20 rounded bg-gray-100 dark:bg-white/5" />
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/5" />
        <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function IntelligenceSection() {
  const [risk, setRisk]           = useState<RiskResult | null>(null);
  const [digest, setDigest]       = useState<DigestResult | null>(null);
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null);
  const [actions, setActions]     = useState<ActionItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [lastRun, setLastRun]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const [riskRes, queueRes] = await Promise.all([
        fetch("/api/intelligence/risk?include=risk,digest,narrative"),
        fetch("/api/intelligence/action-queue?limit=5"),
      ]);
      const riskData  = await riskRes.json();
      const queueData = await queueRes.json();

      if (riskData.risk)      setRisk(riskData.risk);
      if (riskData.digest)    setDigest(riskData.digest);
      if (riskData.narrative) setNarrative(riskData.narrative);
      if (queueData.actions)  setActions(queueData.actions);
      setLastRun(new Date().toLocaleTimeString());
    } catch {
      setError("Analysis failed — check API keys are configured");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(id: string) {
    fetch("/api/intelligence/action-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: id, operation: "approve" }),
    }).catch(() => {});
    setActions(prev => prev.filter(a => a.id !== id));
  }

  function handleDismiss(id: string) {
    fetch("/api/intelligence/action-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: id, operation: "dismiss" }),
    }).catch(() => {});
    setActions(prev => prev.filter(a => a.id !== id));
  }

  const hasRun = lastRun !== null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#C8102E] text-sm">✦</span>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Intelligence</h2>
          {lastRun && <span className="text-[10px] text-gray-400">Updated {lastRun}</span>}
        </div>
        <button onClick={runAnalysis} disabled={loading}
          className="rounded-lg bg-[#C8102E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#A50D25] disabled:opacity-50 transition-colors">
          {loading ? "Analyzing…" : "Run Analysis →"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 3-card strip */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Risk */}
        {loading ? <SkeletonCard title="Occupancy Risk" /> :
         !hasRun ? <EmptyCard title="Occupancy Risk" description="Run analysis to see risk score" /> :
         risk ? (
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#1C1F2E]">
            <p className="text-xs font-medium text-gray-400 mb-2">Occupancy Risk</p>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-2xl font-bold tabular-nums ${risk.riskScore >= 70 ? "text-red-500" : risk.riskScore >= 40 ? "text-amber-500" : "text-green-500"}`}>
                {risk.riskScore}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RISK_STYLES[risk.riskLevel].badge}`}>
                {RISK_STYLES[risk.riskLevel].label}
              </span>
            </div>
            <div className="mb-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10">
              <div className={`h-1.5 rounded-full ${RISK_STYLES[risk.riskLevel].bar}`} style={{ width: `${risk.riskScore}%` }} />
            </div>
            {risk.topDrivers.slice(0, 2).map((d, i) => (
              <p key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                {d}
              </p>
            ))}
          </div>
         ) : null}

        {/* Digest */}
        {loading ? <SkeletonCard title="Weekly Digest" /> :
         !hasRun ? <EmptyCard title="Weekly Digest" description="Run analysis to see weekly summary" /> :
         digest ? (
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#1C1F2E]">
            <p className="text-xs font-medium text-gray-400 mb-2">Weekly Digest</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-3">{digest.headline}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Leads",   value: digest.leadsGenerated },
                { label: "Leases",  value: digest.leasesSigned },
                { label: "Resp min", value: digest.avgResponseTimeMin.toFixed(1) },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-gray-50 dark:bg-white/5 px-2 py-2 text-center">
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[#C8102E]/20 bg-[#C8102E]/5 px-3 py-2">
              <p className="text-[11px] font-semibold text-[#C8102E] mb-0.5">Next move</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{digest.recommendedNextMove}</p>
            </div>
          </div>
         ) : null}

        {/* Narrative */}
        {loading ? <SkeletonCard title="AI Narrative" /> :
         !hasRun ? <EmptyCard title="AI Narrative" description="Run analysis to see AI insights" /> :
         narrative ? (
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#1C1F2E]">
            <p className="text-xs font-medium text-gray-400 mb-2">AI Narrative</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-2">{narrative.headline}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{narrative.explanation}</p>
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2">
              <span className="text-[#C8102E] text-xs mt-0.5 shrink-0">→</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{narrative.recommendedAction}</p>
            </div>
          </div>
         ) : null}
      </div>

      {/* Action queue */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#1C1F2E]">
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Action Queue</h3>
            <p className="mt-0.5 text-xs text-gray-400">Recommended actions · approve or dismiss</p>
          </div>
          {actions.length > 0 && (
            <span className="rounded-full bg-[#C8102E] px-2.5 py-0.5 text-xs font-bold text-white">{actions.length}</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 px-6 py-4">
            {[1,2].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />)}
          </div>
        ) : !hasRun ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Run analysis to see AI-recommended actions.</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">All caught up</p>
            <p className="text-xs text-gray-400">No pending actions right now</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {actions.map(action => (
              <div key={action.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
                <span className={`mt-1.5 hidden h-2 w-2 shrink-0 rounded-full sm:block ${URGENCY_DOT[action.urgency]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{action.title}</p>
                    <span className="rounded bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                      {ACTION_TYPE_LABELS[action.action_type] ?? action.action_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{action.reason}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => handleApprove(action.id)}
                    className="rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A50D25] transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleDismiss(action.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:border-white/10 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
