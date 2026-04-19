"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = "pending_approval" | "approved" | "active" | "paused" | "completed";
type AdChannel = "facebook" | "google" | "instagram";

interface AdVariation {
  id: string;
  variation_num: number;
  headline: string;
  primary_text: string;
  cta: string;
  channel: AdChannel;
  approved: boolean;
}

interface Campaign {
  id: string;
  property: string;
  status: CampaignStatus;
  messaging_angle: string;
  recommended_channels: AdChannel[];
  urgency: string;
  current_special: string | null;
  created_at: string;
  leads_generated: number;
  variations: AdVariation[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    property: "The Monroe",
    status: "pending_approval",
    messaging_angle: "Highlight the modern finishes and unbeatable downtown location to attract young professionals.",
    recommended_channels: ["facebook", "instagram"],
    urgency: "high",
    current_special: "1 month free on 12-month leases",
    created_at: "Apr 18, 2026",
    leads_generated: 0,
    variations: [
      { id: "v1", variation_num: 1, headline: "Live Downtown. Pay Less.", primary_text: "Modern 1 & 2BR apartments in the heart of the city. 1 month free on 12-month leases — limited availability.", cta: "See Floor Plans", channel: "facebook", approved: false },
      { id: "v2", variation_num: 2, headline: "Your City. Your Home.", primary_text: "The Monroe puts you steps from everything. Sleek finishes, in-unit W/D, rooftop access. Schedule a tour today.", cta: "Book a Tour", channel: "instagram", approved: false },
      { id: "v3", variation_num: 3, headline: "1 Month Free — Act Fast", primary_text: "Don't miss out. Apartments at The Monroe are filling up fast. 1BR from $1,450/mo with our limited-time move-in special.", cta: "Claim Offer", channel: "facebook", approved: false },
      { id: "v4", variation_num: 4, headline: "Modern. Central. Yours.", primary_text: "The Monroe: premium downtown living at a price that works. Walk to work, restaurants, and nightlife. Tour this week.", cta: "Apply Now", channel: "instagram", approved: false },
    ],
  },
  {
    id: "c2",
    property: "Parkview Commons",
    status: "active",
    messaging_angle: "Emphasize family-friendly amenities and safety to attract families and long-term renters.",
    recommended_channels: ["facebook", "google"],
    urgency: "normal",
    current_special: "$500 off first month",
    created_at: "Apr 10, 2026",
    leads_generated: 23,
    variations: [
      { id: "v5", variation_num: 1, headline: "Space for Your Family", primary_text: "2 & 3BR apartments at Parkview Commons. Top-rated schools, park views, gated community. $500 off your first month.", cta: "See Availability", channel: "facebook", approved: true },
      { id: "v6", variation_num: 2, headline: "Parkview Commons Apartments", primary_text: "Spacious 2-3BR family apartments near top schools. $500 move-in special. Schedule a tour today.", cta: "Tour Now", channel: "google", approved: true },
    ],
  },
  {
    id: "c3",
    property: "Creekside at Summerlin",
    status: "paused",
    messaging_angle: "Lifestyle-first messaging targeting remote workers seeking quiet, nature-adjacent living.",
    recommended_channels: ["facebook", "instagram"],
    urgency: "low",
    current_special: null,
    created_at: "Mar 28, 2026",
    leads_generated: 47,
    variations: [
      { id: "v7", variation_num: 1, headline: "Work From Anywhere. Live Here.", primary_text: "Fast fiber, peaceful surroundings, and a community that fits your pace. Creekside at Summerlin — your remote work HQ.", cta: "Explore Homes", channel: "facebook", approved: true },
      { id: "v8", variation_num: 2, headline: "Nature Meets Modern Living", primary_text: "Wake up to creek views and mountain trails. Creekside offers resort-style amenities without the resort price.", cta: "See Photos", channel: "instagram", approved: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<CampaignStatus, string> = {
  pending_approval: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved:         "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  active:           "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  paused:           "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  completed:        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  pending_approval: "Pending Approval",
  approved:         "Approved",
  active:           "Active",
  paused:           "Paused",
  completed:        "Completed",
};

const CHANNEL_ICONS: Record<AdChannel, string> = {
  facebook:  "f",
  google:    "G",
  instagram: "in",
};

const CHANNEL_COLORS: Record<AdChannel, string> = {
  facebook:  "bg-blue-600",
  google:    "bg-red-500",
  instagram: "bg-pink-600",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: AdChannel }) {
  return (
    <span className={`inline-flex items-center justify-center h-5 w-7 rounded text-[10px] font-bold text-white ${CHANNEL_COLORS[channel]}`}>
      {CHANNEL_ICONS[channel]}
    </span>
  );
}

function NewCampaignModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "generating" | "done">("form");
  const [form, setForm] = useState({
    property: "",
    special: "",
    renterType: "",
    pricingSummary: "",
    occupancyGoal: "",
    urgency: "normal",
  });

  function handleGenerate() {
    if (!form.property) return;
    setStep("generating");
    setTimeout(() => setStep("done"), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1C1F2E]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">New Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Property *</label>
              <select
                value={form.property}
                onChange={e => setForm(f => ({ ...f, property: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                <option value="">Select a property…</option>
                {["The Monroe", "Parkview Commons", "Creekside at Summerlin", "Sonoran Ridge", "Desert Bloom"].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Current Special / Offer</label>
              <input
                value={form.special}
                onChange={e => setForm(f => ({ ...f, special: e.target.value }))}
                placeholder="e.g. 1 month free on 12-month leases"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Target Renter</label>
              <input
                value={form.renterType}
                onChange={e => setForm(f => ({ ...f, renterType: e.target.value }))}
                placeholder="e.g. young professionals, families, remote workers"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Pricing Summary</label>
              <input
                value={form.pricingSummary}
                onChange={e => setForm(f => ({ ...f, pricingSummary: e.target.value }))}
                placeholder="e.g. 1BR from $1,450/mo, 2BR from $1,800/mo"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Occupancy Goal</label>
                <input
                  value={form.occupancyGoal}
                  onChange={e => setForm(f => ({ ...f, occupancyGoal: e.target.value }))}
                  placeholder="e.g. 95%"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-400">Cancel</button>
              <button
                onClick={handleGenerate}
                disabled={!form.property}
                className="rounded-lg bg-[#C8102E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#A50D25] disabled:opacity-40"
              >
                Generate with AI →
              </button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center gap-4 px-6 py-14">
            <div className="h-10 w-10 rounded-full border-4 border-[#C8102E]/20 border-t-[#C8102E] animate-spin" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">Generating campaign…</p>
            <p className="text-sm text-gray-500">AI is building your strategy and ad variations</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl dark:bg-green-900/30 dark:text-green-400">✓</div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Campaign created!</p>
            <p className="text-sm text-gray-500">4 ad variations are ready for your review. Nothing goes live until you approve.</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg bg-[#C8102E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#A50D25]"
            >
              Review Variations →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignDetail({ campaign, onBack, onApprove }: {
  campaign: Campaign;
  onBack: () => void;
  onApprove: (campaignId: string, variationIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(campaign.variations.filter(v => v.approved).map(v => v.id))
  );
  const [approved, setApproved] = useState(campaign.status !== "pending_approval");

  function toggleVariation(id: string) {
    if (approved) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleApprove() {
    onApprove(campaign.id, Array.from(selected));
    setApproved(true);
  }

  return (
    <div>
      <button onClick={onBack} className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
        ← Back to campaigns
      </button>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{campaign.property}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[campaign.status]}`}>
                {STATUS_LABELS[campaign.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{campaign.messaging_angle}</p>
          </div>
          <div className="flex items-center gap-2">
            {campaign.recommended_channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{campaign.created_at}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Leads Generated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{campaign.leads_generated}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Special Offer</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{campaign.current_special ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Ad Variations */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ad Variations</h3>
        {!approved && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Select the variations you want to approve</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {campaign.variations.map(v => {
          const isSelected = selected.has(v.id);
          return (
            <div
              key={v.id}
              onClick={() => toggleVariation(v.id)}
              className={`rounded-xl border p-5 transition-colors ${
                approved
                  ? v.approved
                    ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
                    : "border-gray-100 bg-white dark:border-white/5 dark:bg-[#1C1F2E]"
                  : isSelected
                    ? "border-[#C8102E]/40 bg-[#C8102E]/5 cursor-pointer dark:border-[#C8102E]/30 dark:bg-[#C8102E]/10"
                    : "border-gray-100 bg-white cursor-pointer hover:border-gray-300 dark:border-white/5 dark:bg-[#1C1F2E] dark:hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ChannelBadge channel={v.channel} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Variation {v.variation_num}</span>
                </div>
                {approved ? (
                  v.approved && <span className="text-xs font-semibold text-green-600 dark:text-green-400">✓ Approved</span>
                ) : (
                  <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? "border-[#C8102E] bg-[#C8102E]" : "border-gray-300 dark:border-white/20"
                  }`}>
                    {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                  </div>
                )}
              </div>
              <p className="mt-3 font-bold text-gray-900 dark:text-gray-100">{v.headline}</p>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.primary_text}</p>
              <div className="mt-3 inline-flex rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                {v.cta} →
              </div>
            </div>
          );
        })}
      </div>

      {!approved && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.size} variation{selected.size !== 1 ? "s" : ""} selected</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nothing goes live until you approve</p>
          </div>
          <button
            onClick={handleApprove}
            disabled={selected.size === 0}
            className="rounded-lg bg-[#C8102E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#A50D25] disabled:opacity-40"
          >
            Approve & Launch →
          </button>
        </div>
      )}

      {approved && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900/40 dark:bg-green-900/10">
          <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">Campaign approved. Variations are live.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");

  const selected = campaigns.find(c => c.id === selectedId) ?? null;

  function handleApprove(campaignId: string, variationIds: string[]) {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== campaignId) return c;
      return {
        ...c,
        status: "approved" as CampaignStatus,
        variations: c.variations.map(v => ({
          ...v,
          approved: variationIds.includes(v.id),
        })),
      };
    }));
  }

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  const totalLeads = campaigns.reduce((s, c) => s + c.leads_generated, 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const pendingApproval = campaigns.filter(c => c.status === "pending_approval").length;

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {selected ? (
          <CampaignDetail
            campaign={selected}
            onBack={() => setSelectedId(null)}
            onApprove={handleApprove}
          />
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Marketing</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-generated ad campaigns · you approve before anything goes live</p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A50D25] transition-colors"
              >
                + New Campaign
              </button>
            </div>

            {/* KPI strip */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: "Total Leads Generated",  value: totalLeads,       note: "across all campaigns" },
                { label: "Active Campaigns",        value: activeCampaigns,  note: "currently running"    },
                { label: "Pending Your Approval",   value: pendingApproval,  note: "review required"      },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{s.note}</p>
                </div>
              ))}
            </div>

            {/* Pending approval banner */}
            {pendingApproval > 0 && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                <span className="text-amber-500 text-lg">⚠</span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">{pendingApproval} campaign{pendingApproval > 1 ? "s" : ""} waiting for your approval.</span>{" "}
                  Nothing goes live until you review and approve the ad variations.
                </p>
              </div>
            )}

            {/* Filter tabs */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {(["all", "pending_approval", "active", "approved", "paused"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    filter === f
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                  }`}
                >
                  {f === "all" ? "All" : STATUS_LABELS[f]}
                </button>
              ))}
            </div>

            {/* Campaign list */}
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-white/5 dark:bg-[#1C1F2E]">
                  <p className="text-gray-400 dark:text-gray-500">No campaigns yet. Click <strong>+ New Campaign</strong> to generate one with AI.</p>
                </div>
              )}
              {filtered.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedId(campaign.id)}
                  className="cursor-pointer rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/5 dark:bg-[#1C1F2E]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{campaign.property}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[campaign.status]}`}>
                          {STATUS_LABELS[campaign.status]}
                        </span>
                        {campaign.urgency === "high" && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            High urgency
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{campaign.messaging_angle}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{campaign.leads_generated}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">leads</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {campaign.recommended_channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">›</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-white/5 pt-3">
                    <span>{campaign.variations.length} variations</span>
                    {campaign.current_special && <span>· {campaign.current_special}</span>}
                    <span>· Created {campaign.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showNew && <NewCampaignModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
