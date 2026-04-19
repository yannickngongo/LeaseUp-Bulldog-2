"use client";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and billing</p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Profile</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input defaultValue="Marcus" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-white/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input defaultValue="Thompson" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-white/20" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" defaultValue="marcus@sunriseproperties.com" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
              <input defaultValue="Sunrise Properties LLC" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-white/20" />
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
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Plan & Billing</h2>

          <div className="mb-6 rounded-xl border border-[#C8102E]/20 bg-[#C8102E]/5 p-4 dark:border-[#C8102E]/30 dark:bg-[#C8102E]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Growth Plan</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Up to 10 properties · $399/mo per property</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Next billing date: May 19, 2026 · 2 active properties → $798/mo</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment method</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Visa ending in 4242</p>
              </div>
              <button className="text-xs font-medium text-[#C8102E] hover:underline">Update</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Billing history</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Invoices and receipts</p>
              </div>
              <button className="text-xs font-medium text-[#C8102E] hover:underline">View</button>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
              Upgrade Plan
            </button>
            <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1C1F2E]">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Integrations</h2>
          <div className="space-y-3">
            {[
              { name: "Twilio", desc: "SMS delivery for AI responses", status: "connected" },
              { name: "Anthropic (Claude)", desc: "AI engine for lead replies", status: "connected" },
              { name: "Supabase", desc: "Database and storage", status: "connected" },
              { name: "Zapier", desc: "Connect to 5000+ apps", status: "coming_soon" },
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
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between rounded-lg border border-red-100 px-4 py-3 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
