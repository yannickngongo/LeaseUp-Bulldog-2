"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LeadStatus = "new" | "contacted" | "engaged" | "tour_scheduled" | "applied" | "won" | "lost";

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  created_at: string;
  ai_generated: boolean;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property_id: string;
  property_name?: string;
  property_phone?: string;
  status: LeadStatus;
  source: string;
  preferred_contact: "sms" | "email" | "call";
  move_in_date?: string;
  bedrooms?: number;
  budget_min?: number;
  budget_max?: number;
  pets?: boolean;
  ai_score?: number;
  ai_summary?: string;
  notes?: string;
  created_at: string;
  last_contacted_at?: string;
}

interface Property {
  id: string;
  name: string;
  phone_number: string;
}

type FilterKey = "all" | "new" | "hot" | "follow_up" | "tour_scheduled" | "applied" | "lost";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LeadStatus, { label: string; glow: string; dot: string; text: string }> = {
  new:            { label: "New",           glow: "#3b82f6", dot: "bg-blue-400",   text: "text-blue-300" },
  contacted:      { label: "Contacted",     glow: "#22d3ee", dot: "bg-cyan-400",   text: "text-cyan-300" },
  engaged:        { label: "Engaged",       glow: "#a78bfa", dot: "bg-violet-400", text: "text-violet-300" },
  tour_scheduled: { label: "Tour Booked",   glow: "#fbbf24", dot: "bg-amber-400",  text: "text-amber-300" },
  applied:        { label: "Applied",       glow: "#f97316", dot: "bg-orange-400", text: "text-orange-300" },
  won:            { label: "Won",           glow: "#10b981", dot: "bg-emerald-400", text: "text-emerald-300" },
  lost:           { label: "Lost",          glow: "#6b7280", dot: "bg-gray-500",   text: "text-gray-500" },
};

const AVATAR_PALETTE = [
  { bg: "rgba(200,16,46,0.15)",   ring: "#C8102E",  text: "#ff6b8a" },
  { bg: "rgba(139,92,246,0.15)",  ring: "#8b5cf6",  text: "#c4b5fd" },
  { bg: "rgba(16,185,129,0.15)",  ring: "#10b981",  text: "#6ee7b7" },
  { bg: "rgba(251,191,36,0.15)",  ring: "#fbbf24",  text: "#fde68a" },
  { bg: "rgba(34,211,238,0.15)",  ring: "#22d3ee",  text: "#a5f3fc" },
  { bg: "rgba(249,115,22,0.15)",  ring: "#f97316",  text: "#fed7aa" },
];

function avatarFor(id: string) {
  return AVATAR_PALETTE[id.charCodeAt(0) % AVATAR_PALETTE.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "now";
  if (mins < 60)  return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7)   return `${days}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function msgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function msgDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatBudget(min?: number, max?: number): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/mo`;
  if (min) return `${fmt(min)}+/mo`;
  return `Up to ${fmt(max!)}/mo`;
}

function applyFilter(leads: Lead[], filter: FilterKey): Lead[] {
  switch (filter) {
    case "new":            return leads.filter((l) => l.status === "new");
    case "hot":            return leads.filter((l) => (l.ai_score ?? 0) >= 7 || ["tour_scheduled", "applied"].includes(l.status));
    case "follow_up":      return leads.filter((l) => l.status === "contacted");
    case "tour_scheduled": return leads.filter((l) => l.status === "tour_scheduled");
    case "applied":        return leads.filter((l) => l.status === "applied");
    case "lost":           return leads.filter((l) => l.status === "lost");
    default:               return leads;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Score ring component
// ─────────────────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#fbbf24" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={3}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size < 36 ? 9 : 11} fontWeight={700} fill={color} fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Lead Modal
// ─────────────────────────────────────────────────────────────────────────────

interface PropertyOption { id: string; name: string; phone_number: string; }

function AddLeadModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [properties, setProperties]   = useState<PropertyOption[]>([]);
  const [propertyId, setPropertyId]   = useState("");
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [moveIn, setMoveIn]           = useState("");
  const [unitType, setUnitType]       = useState("");
  const [budgetMin, setBudgetMin]     = useState("");
  const [budgetMax, setBudgetMax]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [aiMessage, setAiMessage]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user?.email) return;
      const res = await fetch(`/api/properties?email=${encodeURIComponent(user.email)}`);
      const json = await res.json();
      if (json.properties?.length) {
        setProperties(json.properties);
        setPropertyId(json.properties[0].id);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        propertyId, firstName: firstName.trim(), lastName: lastName.trim(),
        phone: phone.trim(), source: "manual",
      };
      if (email.trim())   body.email = email.trim();
      if (moveIn)         body.desiredMoveDate = moveIn;
      if (unitType)       body.unitType = unitType;
      if (budgetMin || budgetMax) {
        body.budget = {} as Record<string, number>;
        if (budgetMin) (body.budget as Record<string, number>).min = parseInt(budgetMin);
        if (budgetMax) (body.budget as Record<string, number>).max = parseInt(budgetMax);
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed"); return; }
      setAiMessage(json.message ?? "");
      setSuccess(true);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-[#e8e6f0] placeholder-white/25 focus:border-[#C8102E]/50 focus:outline-none transition-colors";

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/8 bg-[#13121f] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10"
            style={{ boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2} className="h-7 w-7">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-[#e8e6f0]">Lead Added</h3>
          <p className="mb-4 text-sm text-white/40">AI welcome SMS sent automatically</p>
          {aiMessage && (
            <div className="mb-6 rounded-xl border border-violet-500/15 bg-violet-500/8 p-3 text-left">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-violet-400">AI sent</p>
              <p className="text-sm leading-relaxed text-white/70">{aiMessage}</p>
            </div>
          )}
          <button onClick={() => { onAdded(); onClose(); }}
            className="w-full rounded-xl bg-[#C8102E] py-2.5 text-sm font-semibold text-white hover:bg-[#A50D25] transition-colors"
            style={{ boxShadow: "0 0 16px rgba(200,16,46,0.3)" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/8 bg-[#13121f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="font-semibold text-[#e8e6f0]">New Lead</h2>
            <p className="text-xs text-white/35">AI will send a welcome SMS instantly</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/6 text-white/40 hover:border-white/12 hover:text-white/70 transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Property</label>
              {properties.length === 0
                ? <p className="text-xs text-white/30">Loading…</p>
                : <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required className={inputCls} style={{ background: "rgba(255,255,255,0.04)" }}>
                    {properties.map((p) => <option key={p.id} value={p.id} style={{ background: "#13121f" }}>{p.name}</option>)}
                  </select>
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">First Name</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jordan" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Last Name</label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ellis" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+17025550101" className={inputCls} />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Email <span className="normal-case text-white/20">(optional)</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@email.com" className={inputCls} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Move-in</label>
                <input type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Unit</label>
                <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className={inputCls} style={{ background: "rgba(255,255,255,0.04)" }}>
                  <option value="" style={{ background: "#13121f" }}>Any</option>
                  <option value="studio" style={{ background: "#13121f" }}>Studio</option>
                  <option value="1br" style={{ background: "#13121f" }}>1 BR</option>
                  <option value="2br" style={{ background: "#13121f" }}>2 BR</option>
                  <option value="3br" style={{ background: "#13121f" }}>3 BR</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Budget</label>
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/6 px-6 py-4">
            {error
              ? <p className="text-xs text-red-400">{error}</p>
              : <span />
            }
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="rounded-lg border border-white/8 px-4 py-2 text-sm text-white/50 hover:border-white/15 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button type="submit"
                disabled={loading || !propertyId || !firstName || !lastName || !phone}
                className={cn(
                  "rounded-lg px-5 py-2 text-sm font-semibold transition-colors",
                  loading || !propertyId || !firstName || !lastName || !phone
                    ? "cursor-not-allowed bg-white/6 text-white/25"
                    : "bg-[#C8102E] text-white hover:bg-[#A50D25]"
                )}
                style={(!loading && propertyId && firstName && lastName && phone) ? { boxShadow: "0 0 16px rgba(200,16,46,0.3)" } : {}}>
                {loading ? "Sending…" : "Add + Send SMS →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead list item
// ─────────────────────────────────────────────────────────────────────────────

function LeadItem({
  lead,
  isSelected,
  onClick,
}: {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}) {
  const av = avatarFor(lead.id);
  const sc = STATUS_CONFIG[lead.status];
  const isNew = lead.status === "new";
  const time = lead.last_contacted_at ?? lead.created_at;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full px-3 py-3 text-left transition-all duration-150",
        isSelected
          ? "bg-white/5"
          : "hover:bg-white/3"
      )}
    >
      {/* Selected left glow bar */}
      {isSelected && (
        <div className="absolute inset-y-0 left-0 w-0.5 rounded-r-full"
          style={{ background: "#C8102E", boxShadow: "0 0 8px #C8102E" }} />
      )}

      <div className="flex items-start gap-3 pl-1.5">
        {/* Avatar */}
        <div className="relative mt-0.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold"
            style={{ background: av.bg, color: av.text, border: `1px solid ${av.ring}22` }}>
            {initials(lead.name)}
          </div>
          {/* Status dot */}
          <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2", sc.dot)}
            style={{ borderColor: "#0f0e1e", boxShadow: `0 0 6px ${sc.glow}` }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "truncate text-sm font-medium",
              isSelected ? "text-[#e8e6f0]" : "text-white/80 group-hover:text-[#e8e6f0]"
            )}>
              {lead.name}
              {isNew && <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" style={{ boxShadow: "0 0 6px #3b82f6" }} />}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-white/25">{relativeTime(time)}</span>
          </div>

          <p className="mt-0.5 text-[11px] text-white/30">{lead.property_name ?? "—"}</p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className={cn("text-[10px] font-medium", sc.text)}>{sc.label}</span>
            {lead.ai_score != null && (
              <span className={cn(
                "font-mono text-[10px] font-bold tabular-nums",
                lead.ai_score >= 7 ? "text-emerald-400" : lead.ai_score >= 4 ? "text-amber-400" : "text-red-400"
              )}>
                {lead.ai_score}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Left panel
// ─────────────────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",            label: "All" },
  { key: "new",            label: "New" },
  { key: "hot",            label: "Hot" },
  { key: "follow_up",      label: "Follow-up" },
  { key: "tour_scheduled", label: "Tours" },
  { key: "applied",        label: "Applied" },
  { key: "lost",           label: "Lost" },
];

function LeftPanel({
  leads, selectedId, filter, search, loading,
  onSelect, onFilterChange, onSearchChange, onAddLead,
}: {
  leads: Lead[];
  selectedId: string;
  filter: FilterKey;
  search: string;
  loading: boolean;
  onSelect: (id: string) => void;
  onFilterChange: (f: FilterKey) => void;
  onSearchChange: (q: string) => void;
  onAddLead: () => void;
}) {
  const filtered = applyFilter(
    leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    filter
  );
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="flex w-[260px] shrink-0 flex-col border-r border-white/5 bg-[#0f0e1e]">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#e8e6f0]">Leads</span>
            {newCount > 0 && (
              <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-400"
                style={{ boxShadow: "0 0 6px rgba(59,130,246,0.2)" }}>
                {newCount} new
              </span>
            )}
          </div>
          <button onClick={onAddLead}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8102E]/30 bg-[#C8102E]/10 text-[#C8102E] hover:bg-[#C8102E]/20 transition-colors"
            style={{ boxShadow: "0 0 8px rgba(200,16,46,0.15)" }}
            title="Add Lead">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 px-2.5 py-1.5">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5 shrink-0 text-white/25">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5l3 3" strokeLinecap="round" />
          </svg>
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-xs text-[#e8e6f0] placeholder-white/20 focus:outline-none" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2 scrollbar-hide">
        {FILTERS.map((f) => {
          const count = applyFilter(leads, f.key).length;
          return (
            <button key={f.key} onClick={() => onFilterChange(f.key)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                filter === f.key
                  ? "bg-[#C8102E]/15 text-[#ff6b8a]"
                  : "text-white/30 hover:text-white/60"
              )}>
              {f.label}
              <span className={cn("font-mono text-[9px] tabular-nums", filter === f.key ? "text-[#C8102E]/70" : "text-white/20")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/4 bg-white/2 p-3 animate-pulse">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/5" />
                  <div className="h-2.5 w-16 rounded bg-white/4" />
                  <div className="h-2 w-12 rounded bg-white/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/6 bg-white/3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white/20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-white/25">No leads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/3">
            {filtered.map((lead) => (
              <LeadItem
                key={lead.id}
                lead={lead}
                isSelected={lead.id === selectedId}
                onClick={() => onSelect(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation panel
// ─────────────────────────────────────────────────────────────────────────────

function ConversationPanel({
  lead,
  messages,
  messagesLoading,
  replyText,
  sending,
  onReplyChange,
  onSend,
}: {
  lead: Lead;
  messages: Message[];
  messagesLoading: boolean;
  replyText: string;
  sending: boolean;
  onReplyChange: (t: string) => void;
  onSend: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const av = avatarFor(lead.id);
  const sc = STATUS_CONFIG[lead.status];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, lead.id]);

  // Group by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const date = msgDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last?.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#080714]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#0f0e1e]/80 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
              style={{ background: av.bg, color: av.text, border: `1px solid ${av.ring}22` }}>
              {initials(lead.name)}
            </div>
            <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2", sc.dot)}
              style={{ borderColor: "#0f0e1e", boxShadow: `0 0 6px ${sc.glow}` }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#e8e6f0]">{lead.name}</span>
              <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", sc.text)}
                style={{ background: `${sc.glow}15`, border: `1px solid ${sc.glow}20` }}>
                {sc.label}
              </span>
            </div>
            <p className="text-[11px] text-white/30">{lead.phone} · {lead.property_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lead.ai_score != null && <ScoreRing score={lead.ai_score} size={34} />}
          <button className="rounded-lg border border-white/6 bg-white/3 px-3 py-1.5 text-[11px] text-white/40 hover:border-white/12 hover:text-white/70 transition-colors">
            Profile
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-2xl">
          {messagesLoading ? (
            <div className="flex flex-col gap-4">
              {[1,2,3].map((i) => (
                <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                  <div className="h-12 w-48 animate-pulse rounded-2xl bg-white/5" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-white/20">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-white/25">No messages yet</p>
              <p className="mt-1 text-xs text-white/15">Send the first message below</p>
            </div>
          ) : (
            <div className="space-y-1">
              {grouped.map(({ date, msgs }) => (
                <div key={date}>
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                    <span className="text-[10px] font-medium tracking-wide text-white/20">{date}</span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </div>
                  <div className="space-y-3">
                    {msgs.map((msg) => {
                      const isOut = msg.direction === "outbound";
                      return (
                        <div key={msg.id} className={cn("flex gap-2", isOut ? "flex-row-reverse" : "flex-row")}>
                          {!isOut && (
                            <div className="flex h-7 w-7 shrink-0 self-end items-center justify-center rounded-full text-[10px] font-bold"
                              style={{ background: av.bg, color: av.text }}>
                              {initials(lead.name)[0]}
                            </div>
                          )}
                          <div className={cn("flex max-w-[68%] flex-col", isOut ? "items-end" : "items-start")}>
                            <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed", isOut ? "rounded-tr-sm" : "rounded-tl-sm")}
                              style={isOut
                                ? { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)", color: "#e8e6f0" }
                                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(232,230,240,0.75)" }
                              }>
                              {msg.body}
                            </div>
                            <div className={cn("mt-1 flex items-center gap-1.5", isOut ? "flex-row-reverse" : "flex-row")}>
                              <span className="font-mono text-[10px] text-white/20">{msgTime(msg.created_at)}</span>
                              {isOut && msg.ai_generated && (
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-violet-400"
                                  style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.15)" }}>
                                  AI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      {/* Reply box */}
      <div className="shrink-0 border-t border-white/5 bg-[#0f0e1e]/80 backdrop-blur-sm">
        {/* Quick chips */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/4 px-4 py-2 scrollbar-hide">
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-widest text-white/20">Quick</span>
          {["Schedule Tour", "Send Application Link", "Follow Up", "Mark Won"].map((label) => (
            <button key={label}
              className="shrink-0 rounded-md border border-white/6 bg-white/3 px-2.5 py-1 text-[10px] font-medium text-white/35 hover:border-white/12 hover:text-white/60 transition-colors">
              {label}
            </button>
          ))}
          <button className="ml-auto shrink-0 rounded-md border border-red-500/15 bg-red-500/8 px-2.5 py-1 text-[10px] font-medium text-red-400/70 hover:text-red-400 transition-colors">
            Mark Lost
          </button>
        </div>

        <div className="px-4 pb-4 pt-3">
          <textarea value={replyText} onChange={(e) => onReplyChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend(); }}
            placeholder="Type a message… (⌘ + Enter to send)"
            rows={3}
            className="w-full resize-none rounded-xl border border-white/6 bg-white/3 px-4 py-3 text-sm text-[#e8e6f0] placeholder-white/20 transition-colors focus:border-white/12 focus:bg-white/5 focus:outline-none" />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/20">{replyText.length} chars</span>
            <button onClick={onSend} disabled={!replyText.trim() || sending}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-colors",
                replyText.trim() && !sending
                  ? "bg-[#C8102E] text-white hover:bg-[#A50D25]"
                  : "cursor-not-allowed bg-white/6 text-white/20"
              )}
              style={replyText.trim() && !sending ? { boxShadow: "0 0 12px rgba(200,16,46,0.25)" } : {}}>
              {sending ? "Sending…" : "Send SMS →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right detail panel
// ─────────────────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[11px] text-white/30">{label}</span>
      <span className="text-right text-xs font-medium text-white/70">{value ?? "—"}</span>
    </div>
  );
}

function DetailPanel({ lead }: { lead: Lead }) {
  const sc = STATUS_CONFIG[lead.status];
  const av = avatarFor(lead.id);

  return (
    <div className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-[#0f0e1e]">
      {/* Identity card */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
            style={{ background: av.bg, color: av.text, border: `1px solid ${av.ring}25` }}>
            {initials(lead.name)}
          </div>
          <div>
            <p className="font-semibold text-[#e8e6f0]">{lead.name}</p>
            <span className={cn("text-[10px] font-semibold", sc.text)}
              style={{ textShadow: `0 0 8px ${sc.glow}` }}>
              {sc.label}
            </span>
          </div>
        </div>

        {lead.ai_score != null && (
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-3">
            <ScoreRing score={lead.ai_score} size={44} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">AI Score</p>
              <p className="text-xs text-white/50">{lead.ai_summary ?? (lead.ai_score >= 7 ? "High intent" : lead.ai_score >= 4 ? "Moderate interest" : "Low engagement")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="border-b border-white/5 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Contact</p>
        <div className="divide-y divide-white/3">
          <StatRow label="Phone" value={<a href={`tel:${lead.phone}`} className="text-[#ff6b8a] hover:underline font-mono text-[11px]">{lead.phone}</a>} />
          <StatRow label="Email" value={lead.email ? <a href={`mailto:${lead.email}`} className="text-[#ff6b8a] hover:underline">{lead.email}</a> : "—"} />
          <StatRow label="Prefers" value={<span className="capitalize">{lead.preferred_contact}</span>} />
          <StatRow label="Source" value={lead.source} />
        </div>
      </div>

      {/* Qualification */}
      <div className="border-b border-white/5 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Qualification</p>
        <div className="divide-y divide-white/3">
          <StatRow label="Move-in" value={
            lead.move_in_date
              ? new Date(lead.move_in_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—"
          } />
          <StatRow label="Unit" value={
            lead.bedrooms != null ? (lead.bedrooms === 0 ? "Studio" : `${lead.bedrooms} BR`) : "—"
          } />
          <StatRow label="Budget" value={formatBudget(lead.budget_min, lead.budget_max)} />
          <StatRow label="Pets" value={lead.pets === true ? "Yes 🐾" : lead.pets === false ? "No" : "—"} />
        </div>
      </div>

      {/* Property */}
      <div className="border-b border-white/5 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Property</p>
        <div className="divide-y divide-white/3">
          <StatRow label="Name" value={lead.property_name ?? "—"} />
          <StatRow label="AI Line" value={<span className="font-mono text-[11px]">{lead.property_phone ?? "—"}</span>} />
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Internal Notes</p>
        <textarea defaultValue={lead.notes ?? ""}
          placeholder="Add a private note…"
          rows={4}
          className="w-full resize-none rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-xs text-white/60 placeholder-white/15 transition-colors focus:border-white/12 focus:bg-white/5 focus:outline-none" />
        <button className="mt-2 w-full rounded-lg border border-white/6 py-1.5 text-[11px] text-white/30 hover:border-white/12 hover:text-white/50 transition-colors">
          Save Note
        </button>
      </div>

      {/* Danger */}
      <div className="space-y-1.5 border-t border-white/5 p-4">
        <button className="w-full rounded-lg border border-white/5 py-2 text-[11px] text-white/25 hover:border-white/10 hover:text-white/40 transition-colors">
          Unsubscribe Lead
        </button>
        <button className="w-full rounded-lg border border-red-500/10 py-2 text-[11px] text-red-500/40 hover:border-red-500/20 hover:text-red-500/60 transition-colors">
          Delete Lead
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [properties, setProperties]   = useState<Property[]>([]);
  const [selectedId, setSelectedId]   = useState<string>("");
  const [filter, setFilter]           = useState<FilterKey>("all");
  const [search, setSearch]           = useState("");
  const [leadsLoading, setLeadsLoading] = useState(true);

  const [messages, setMessages]       = useState<Message[]>([]);
  const [msgLoading, setMsgLoading]   = useState(false);
  const [replyText, setReplyText]     = useState("");
  const [sending, setSending]         = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  // ── Load operator's leads on mount ──
  useEffect(() => {
    async function loadAll() {
      setLeadsLoading(true);
      try {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user?.email) { setLeadsLoading(false); return; }

        const propRes = await fetch(`/api/properties?email=${encodeURIComponent(user.email)}`);
        const propJson = await propRes.json();
        const props: Property[] = propJson.properties ?? [];
        setProperties(props);

        const allLeads: Lead[] = [];
        await Promise.all(props.map(async (p) => {
          const res = await fetch(`/api/leads?propertyId=${p.id}`);
          const json = await res.json();
          const rows = (json.leads ?? []) as Lead[];
          rows.forEach((l) => {
            l.property_name  = p.name;
            l.property_phone = p.phone_number;
          });
          allLeads.push(...rows);
        }));

        allLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLeads(allLeads);
        if (allLeads.length > 0) setSelectedId(allLeads[0].id);
      } finally {
        setLeadsLoading(false);
      }
    }
    loadAll();
  }, []);

  // ── Load messages when selected lead changes ──
  useEffect(() => {
    if (!selectedId) return;
    setMsgLoading(true);
    setMessages([]);
    fetch(`/api/conversations?leadId=${selectedId}`)
      .then((r) => r.json())
      .then((j) => setMessages(j.messages ?? []))
      .finally(() => setMsgLoading(false));
  }, [selectedId]);

  const handleSelectLead = useCallback((id: string) => {
    setSelectedId(id);
    setReplyText("");
  }, []);

  const handleSend = useCallback(async () => {
    if (!replyText.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      await fetch("/api/sms/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: selectedId, message: replyText.trim() }),
      });
      setReplyText("");
      // Refresh messages
      const res = await fetch(`/api/conversations?leadId=${selectedId}`);
      const json = await res.json();
      setMessages(json.messages ?? []);
    } finally {
      setSending(false);
    }
  }, [replyText, selectedId, sending]);

  const handleAdded = useCallback(async () => {
    // Reload leads after adding
    setLeadsLoading(true);
    try {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user?.email) return;
      const allLeads: Lead[] = [];
      await Promise.all(properties.map(async (p) => {
        const res = await fetch(`/api/leads?propertyId=${p.id}`);
        const json = await res.json();
        const rows = (json.leads ?? []) as Lead[];
        rows.forEach((l) => {
          l.property_name  = p.name;
          l.property_phone = p.phone_number;
        });
        allLeads.push(...rows);
      }));
      allLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLeads(allLeads);
      if (allLeads.length > 0 && !selectedId) setSelectedId(allLeads[0].id);
    } finally {
      setLeadsLoading(false);
    }
  }, [properties, selectedId]);

  const selectedLead = leads.find((l) => l.id === selectedId);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#080714]">
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          leads={leads}
          selectedId={selectedId}
          filter={filter}
          search={search}
          loading={leadsLoading}
          onSelect={handleSelectLead}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onAddLead={() => setShowAddModal(true)}
        />

        {selectedLead ? (
          <>
            <div className="hidden flex-1 sm:flex">
              <ConversationPanel
                lead={selectedLead}
                messages={messages}
                messagesLoading={msgLoading}
                replyText={replyText}
                sending={sending}
                onReplyChange={setReplyText}
                onSend={handleSend}
              />
            </div>
            <div className="hidden xl:flex">
              <DetailPanel lead={selectedLead} />
            </div>
          </>
        ) : !leadsLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/6 bg-white/2"
              style={{ boxShadow: "0 0 40px rgba(200,16,46,0.05)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="h-8 w-8 text-white/15">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-white/25">No leads yet</p>
            <p className="mt-1 text-xs text-white/15">
              {properties.length === 0 ? "Complete setup first" : "Add your first lead to get started"}
            </p>
            {properties.length > 0 && (
              <button onClick={() => setShowAddModal(true)}
                className="mt-4 rounded-xl bg-[#C8102E]/10 border border-[#C8102E]/20 px-5 py-2 text-sm font-medium text-[#C8102E] hover:bg-[#C8102E]/20 transition-colors">
                Add First Lead
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
