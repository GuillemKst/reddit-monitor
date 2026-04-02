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
    { name: 'Tier 1', subs: ['SaaS', 'startups', 'Entrepreneur', 'SideProject', 'webdev', 'programming', 'reactjs', 'javascript'], freq: 'Every scan' },
    { name: 'Tier 2', subs: ['ProductManagement', 'marketing', 'growthhacking', 'digital_marketing', 'youtubers', 'contentcreation', 'videoediting', 'productivity', 'remotework'], freq: 'Every 3rd scan' },
    { name: 'Tier 3', subs: ['DevTools', 'selfhosted', 'smallbusiness', 'freelance', 'NewTubers', 'MacApps', 'windows', 'software', 'AskTechnology', 'techsupport'], freq: 'Every 6th scan' },
  ];

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white text-[13px] px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-neutral-100 rounded-xl p-5">
          <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">System status</h2>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto" />
          ) : health ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-neutral-500">Status</span>
                <span className="flex items-center gap-1.5 text-[13px] text-neutral-900 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-neutral-500">Uptime</span>
                <span className="text-[13px] text-neutral-700 tabular-nums">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-neutral-500">Last check</span>
                <span className="text-[13px] text-neutral-700">{new Date(health.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Server offline</p>
          )}
        </div>

        <div className="space-y-2">
          {[
            { label: 'Trigger scan', desc: 'Run the scanner now', action: async () => { await triggerScan(); showToast('Scan triggered'); } },
            { label: 'Seed keywords', desc: 'Load default keywords', action: async () => { const r = await seedKeywords(); showToast(r.message); } },
            { label: 'Refresh status', desc: 'Check server health', action: loadHealth },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full text-left border border-neutral-100 hover:border-neutral-200 rounded-xl p-4 transition-colors hover:bg-neutral-50/50"
            >
              <span className="text-[13px] font-medium text-neutral-700 block">{item.label}</span>
              <span className="text-[12px] text-neutral-400 block mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border border-neutral-100 rounded-xl p-5">
        <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-5">Monitored subreddits</h2>
        <div className="space-y-6">
          {tiers.map((t) => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-neutral-700">{t.name}</span>
                <span className="text-[12px] text-neutral-400">{t.freq}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.subs.map((s) => (
                  <span key={s} className="text-[12px] text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-md">
                    r/{s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-neutral-100 rounded-xl p-5">
        <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Configuration</h2>
        <div className="space-y-1.5 font-mono text-[12px]">
          {[
            ['MIN_RELEVANCE_SCORE', '50'],
            ['SCAN_INTERVAL', '10 min'],
            ['EMAIL_TO', 'guillemcastellsf@gmail.com'],
            ['GMAIL', '••••••••••••'],
            ['MONGODB', 'Atlas connected'],
          ].map(([key, val]) => (
            <div key={key} className="flex">
              <span className="text-neutral-400 w-44 shrink-0">{key}</span>
              <span className="text-neutral-300">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
