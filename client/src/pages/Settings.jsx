import { useState, useEffect } from 'react';
import { fetchHealth, triggerScan, seedKeywords } from '../api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { loadHealth(); }, []);

  async function loadHealth() {
    setIsLoading(true);
    try { setHealth(await fetchHealth()); } catch (err) { console.error(err); }
    setIsLoading(false);
  }

  function formatUptime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const tiers = [
    { name: 'Tier 1 — High relevance', subs: ['SaaS', 'startups', 'Entrepreneur', 'SideProject'], freq: 'Every scan' },
    { name: 'Tier 2 — Medium relevance', subs: ['marketing', 'growthhacking', 'digital_marketing', 'contentcreation', 'videoediting', 'ProductManagement', 'IndieDev'], freq: 'Every 3rd scan' },
    { name: 'Tier 3 — Niche', subs: ['smallbusiness', 'socialmedia', 'webdev', 'OnlineBusiness', 'freelance'], freq: 'Every 6th scan' },
  ];

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg font-medium">
          {toast}
        </div>
      )}

      <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-neutral-900 mb-5">System status</h2>
          {isLoading ? (
            <div className="w-7 h-7 border-[3px] border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto" />
          ) : health ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Status</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Uptime</span>
                <span className="text-sm font-medium text-neutral-700 tabular-nums">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Last check</span>
                <span className="text-sm font-medium text-neutral-700">{new Date(health.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500 font-medium">Server offline</p>
          )}
        </div>

        <div className="space-y-3">
          {[
            { label: 'Trigger scan', desc: 'Run the scanner now', action: async () => { await triggerScan(); showToast('Scan triggered'); } },
            { label: 'Seed keywords', desc: 'Load default keyword list', action: async () => { const r = await seedKeywords(); showToast(r.message); } },
            { label: 'Refresh status', desc: 'Check server health', action: loadHealth },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full text-left bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-5 transition-all hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-neutral-800 block">{item.label}</span>
              <span className="text-sm text-neutral-400 block mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-neutral-900 mb-6">Monitored subreddits</h2>
        <div className="space-y-8">
          {tiers.map((t) => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-800">{t.name}</span>
                <span className="text-sm text-neutral-400">{t.freq}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.subs.map((s) => (
                  <span key={s} className="text-sm text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg font-medium">
                    r/{s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-neutral-900 mb-5">Configuration</h2>
        <div className="space-y-3">
          {[
            ['MIN_RELEVANCE_SCORE', '50'],
            ['SCAN_INTERVAL', '10 min'],
            ['EMAIL_TO', 'guillemcastellsf@gmail.com'],
            ['GMAIL', 'Configured'],
            ['MONGODB', 'Atlas connected'],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm text-neutral-500 font-mono">{key}</span>
              <span className="text-sm text-neutral-400 font-mono">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
