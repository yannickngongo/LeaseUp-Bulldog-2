import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

const FAQS = [
  {
    q: "What is the setup fee for?",
    a: "The $1,000 one-time setup fee covers onboarding, property configuration, AI prompt setup, Twilio number provisioning, and a live walkthrough with our team.",
  },
  {
    q: "What does the $1,000/month platform fee include?",
    a: "The full LeaseUp Bulldog platform — AI lead qualification, automated follow-up sequences, human takeover, conversation dashboard, calendar, insights, and unlimited leads.",
  },
  {
    q: "What is the Marketing Add-On?",
    a: "For $2,000/month our AI generates ad strategy, headlines, and copy variations for Facebook and Google. You review and approve each ad before anything goes live. Leads flow directly into your LUB pipeline.",
  },
  {
    q: "How does the $200 performance fee work?",
    a: "You pay $200 for every lease signed through LUB, as long as the lease is signed within 30 days of first contact. We only charge you when we deliver a result.",
  },
  {
    q: "What counts as 'within 30 days'?",
    a: "The 30-day window starts from the date the first AI message is sent to a lead. If a lease is signed within that window and the lead was managed through LUB, the $200 fee applies.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — contact us for a 14-day pilot. You only pay the setup fee to get started. No platform fee is charged during the trial period.",
  },
];

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[#C8102E]">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#08080F] text-white font-sans">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-[#C8102E]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#C8102E]">Pricing</p>
          <h1 className="mb-5 text-5xl font-black tracking-tight md:text-6xl">
            Performance-based pricing.
          </h1>
          <p className="text-lg text-gray-400">
            You pay a flat platform fee — and then only when we deliver a signed lease.
          </p>
        </div>
      </section>

      {/* Fee cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">

          {/* Top row: 2 fixed fees */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {/* Setup Fee */}
            <div className="rounded-2xl border border-[#1E1E2E] bg-[#10101A] p-8">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">One-Time</p>
                <span className="rounded-full border border-[#1E1E2E] px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">Setup</span>
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-5xl font-black text-white">$1,000</span>
              </div>
              <p className="mb-5 text-sm text-gray-400">Paid once at sign-up. Covers everything needed to go live.</p>
              <ul className="space-y-2.5">
                {[
                  "Property onboarding & configuration",
                  "Twilio phone number provisioning",
                  "AI prompt setup & guardrails",
                  "Team walkthrough & training",
                  "First 2 weeks of hands-on support",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Fee */}
            <div className="rounded-2xl border border-[#C8102E] bg-[#C8102E]/5 p-8">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">Monthly</p>
                <span className="rounded-full border border-[#C8102E]/30 bg-[#C8102E]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#C8102E]">Platform</span>
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-5xl font-black text-white">$1,000</span>
                <span className="mb-1.5 text-sm text-gray-400">/month</span>
              </div>
              <p className="mb-5 text-sm text-gray-400">Full platform access. Cancel anytime.</p>
              <ul className="space-y-2.5">
                {[
                  "Unlimited leads",
                  "AI SMS qualification & follow-up",
                  "Human takeover & escalation",
                  "Conversation dashboard",
                  "Calendar & tour tracking",
                  "Performance analytics",
                  "Priority support",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom row: 2 variable fees */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Marketing Add-On */}
            <div className="rounded-2xl border border-[#1E1E2E] bg-[#10101A] p-8">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Add-On · Monthly</p>
                <span className="rounded-full border border-[#1E1E2E] px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">Optional</span>
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-5xl font-black text-white">$2,000</span>
                <span className="mb-1.5 text-sm text-gray-400">/month</span>
              </div>
              <p className="mb-5 text-sm text-gray-400">AI-generated ad campaigns. You approve before anything goes live.</p>
              <ul className="space-y-2.5">
                {[
                  "AI ad strategy (Facebook & Google)",
                  "3–5 creative variations per campaign",
                  "Headline, copy & CTA generation",
                  "Approval required before launch",
                  "Leads flow directly into LUB pipeline",
                  "AI follow-up triggered immediately",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Performance Fee */}
            <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-8">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Per Result</p>
                <span className="rounded-full border border-amber-800/40 bg-amber-900/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">Performance</span>
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-5xl font-black text-white">$200</span>
                <span className="mb-1.5 text-sm text-gray-400">/lease signed</span>
              </div>
              <p className="mb-5 text-sm text-gray-400">Only charged when a LUB-attributed lead signs a lease.</p>
              <ul className="space-y-2.5">
                {[
                  "Only applies to LUB-managed leads",
                  "Lease must be signed within 30 days of first contact",
                  "Attribution window tracked automatically",
                  "Full audit trail per lease",
                  "Monthly invoice with breakdown",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-amber-800/30 bg-amber-900/20 p-4">
                <p className="text-xs font-semibold text-amber-400">Example month</p>
                <p className="mt-1 text-sm text-gray-300">
                  5 leases signed through LUB <span className="text-gray-500">→</span> <span className="font-bold text-white">$1,000</span> in performance fees
                </p>
                <p className="mt-0.5 text-xs text-gray-500">On top of the $1,000 platform fee = $2,000 total that month</p>
              </div>
            </div>
          </div>

          {/* Total example */}
          <div className="mt-6 rounded-2xl border border-[#1E1E2E] bg-[#10101A] p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">What a typical month looks like</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: "Platform Fee",       amount: "$1,000",  note: "flat monthly",         color: "text-white" },
                { label: "Marketing Add-On",   amount: "$2,000",  note: "if opted in",          color: "text-gray-400" },
                { label: "Performance Fees",   amount: "$600",    note: "3 leases × $200",      color: "text-[#C8102E]" },
                { label: "Total",              amount: "$1,600",  note: "without marketing",    color: "text-white" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-[#1E1E2E] p-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`mt-1 text-2xl font-black ${s.color}`}>{s.amount}</p>
                  <p className="mt-0.5 text-[11px] text-gray-600">{s.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/free-trial"
              className="inline-block rounded-xl bg-[#C8102E] px-10 py-4 text-sm font-bold text-white hover:bg-[#A50D25] transition-colors shadow-lg shadow-[#C8102E]/25"
            >
              Get Started →
            </Link>
            <p className="mt-3 text-xs text-gray-600">14-day pilot available. Talk to us before committing.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-[#1E1E2E] px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-black">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-[#1E1E2E] bg-[#10101A] p-6">
                <p className="mb-2 font-semibold text-white">{faq.q}</p>
                <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-[#1E1E2E] px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[600px] rounded-full bg-[#C8102E]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-5 text-4xl font-black">Only pay when we deliver.</h2>
          <p className="mb-8 text-gray-400">$1,000 setup · $1,000/month · $200 per lease signed.</p>
          <Link
            href="/free-trial"
            className="inline-block rounded-xl bg-[#C8102E] px-10 py-4 text-sm font-bold text-white hover:bg-[#A50D25] transition-colors shadow-lg shadow-[#C8102E]/25"
          >
            Start the Conversation →
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
