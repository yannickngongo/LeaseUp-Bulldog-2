"use client";

import { useState } from "react";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  );
}

export default function SettingsPage() {
  const [marketingAddon, setMarketingAddon] = useState(false);

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and billing</p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Profile</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input defaultValue="Marcus" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input defaultValue="Thompson" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" defaultValue="marcus@sunriseproperties.com" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
              <input defaultValue="Sunrise Properties LLC" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100" />
            </div>
            <div className="flex justify-end">
              <button className="rounded-lg bg-[#C8102E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A50D25]">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Plan & Billing */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Plan & Billing</h2>

          {/* Fee breakdown */}
          <div className="space-y-3">

            {/* Setup Fee */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/5 dark:bg-white/3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Setup Fee</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">One-time onboarding &amp; account setup</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$1,000</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckIcon /> Paid
                </span>
              </div>
            </div>

            {/* Platform Fee */}
            <div className="flex items-center justify-between rounded-xl border border-[#C8102E]/20 bg-[#C8102E]/5 px-5 py-4 dark:border-[#C8102E]/30 dark:bg-[#C8102E]/10">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Platform Fee</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full AI leasing suite · unlimited leads</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$1,000<span className="text-xs font-normal text-gray-400">/mo</span></p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckIcon /> Active
                </span>
              </div>
            </div>

            {/* Marketing Add-On */}
            <div className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
              marketingAddon
                ? "border-violet-200 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-900/10"
                : "border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/3"
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Marketing Add-On</p>
                  {marketingAddon && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">Active</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI ad generation · Facebook &amp; Google campaigns · lead funnel automation</p>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$2,000<span className="text-xs font-normal text-gray-400">/mo</span></p>
                <button
                  onClick={() => setMarketingAddon(v => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${marketingAddon ? "bg-violet-500" : "bg-gray-200 dark:bg-white/10"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${marketingAddon ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Performance Fee */}
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-900/10">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Performance Fee</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Charged per lease signed through LUB · within 30-day attribution window</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$200<span className="text-xs font-normal text-gray-400">/lease</span></p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Pay for results</p>
              </div>
            </div>
          </div>

          {/* This month summary */}
          <div className="mt-5 rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-white/5 dark:bg-[#12141E]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">This Month</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Leases signed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C8102E]">$600</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance fees</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {marketingAddon ? "$3,600" : "$1,600"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total due</p>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
              Next billing date: May 1, 2026 · Platform $1,000{marketingAddon ? " + Marketing $2,000" : ""} + $600 performance fees
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center justify-between flex-1 rounded-lg border border-gray-100 px-4 py-3 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment method</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Visa ending in 4242</p>
              </div>
              <button className="text-xs font-medium text-[#C8102E] hover:underline">Update</button>
            </div>
            <div className="flex items-center justify-between flex-1 rounded-lg border border-gray-100 px-4 py-3 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Billing history</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Invoices and receipts</p>
              </div>
              <button className="text-xs font-medium text-[#C8102E] hover:underline">View</button>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Integrations</h2>
          <div className="space-y-3">
            {[
              { name: "Twilio",           desc: "SMS delivery for AI responses",   status: "connected" },
              { name: "Anthropic (Claude)", desc: "AI engine for lead replies",    status: "connected" },
              { name: "Supabase",         desc: "Database and storage",            status: "connected" },
              { name: "Zapier",           desc: "Connect to 5,000+ apps",          status: "coming_soon" },
            ].map((int) => (
              <div key={int.name} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-white/5">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{int.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{int.desc}</p>
                </div>
                {int.status === "connected" ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between rounded-lg border border-red-100 px-4 py-3 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data. Cannot be undone.</p>
            </div>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
