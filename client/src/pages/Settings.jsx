import { useState, useEffect } from 'react';
import { fetchHealth, triggerScan, seedKeywords } from '../api';

function ActionCard({ title, description, onClick, variant = 'default', loading, loadingText }) {
  const styles = {
    default: 'border-white/[0.06] hover:border-white/[0.1]',
    orange: 'border-orange-500/20 hover:border-orange-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full bg-white/[0.02] border rounded-xl p-4 text-left transition-all duration-200 hover:bg-white/[0.04] disabled:opacity-50 ${styles[variant]}`}
    >
      <span className="text-[13px] font-medium text-white/80 block">{loading ? loadingText : title}</span>
      <span className="text-[11px] text-white/25 mt-0.5 block">{description}</span>
    </button>
  );
}

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

  async function handleScan() {
    try { await triggerScan(); showToast('Scan triggered'); } catch (err) { showToast(err.message); }
  }

  async function handleSeed() {
    try { const r = await seedKeywords(); showToast(r.message); } catch (err) { showToast(err.message); }
  }

  const tiers = [
    { name: 'Tier 1', subs: ['SaaS', 'startups', 'Entrepreneur', 'SideProject', 'webdev', 'programming', 'reactjs', 'javascript'], freq: 'Every scan', color: 'text-orange-400' },
    { name: 'Tier 2', subs: ['ProductManagement', 'marketing', 'growthhacking', 'digital_marketing', 'youtubers', 'contentcreation', 'videoediting', 'productivity', 'remotework'], freq: 'Every 3rd scan', color: 'text-amber-400' },
    { name: 'Tier 3', subs: ['DevTools', 'selfhosted', 'smallbusiness', 'freelance', 'NewTubers', 'MacApps', 'windows', 'software', 'AskTechnology', 'techsupport'], freq: 'Every 6th scan', color: 'text-white/40' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-xl border border-white/[0.1] text-white/80 text-[13px] px-4 py-2.5 rounded-xl shadow-2xl">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-semibold text-white tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">System</h2>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          ) : health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/40">Status</span>
                <span className="flex items-center gap-1.5 text-[13px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/40">Uptime</span>
                <span className="text-[13px] text-white/60 tabular-nums">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/40">Last check</span>
                <span className="text-[13px] text-white/60">{new Date(health.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-400 text-[13px]">Server offline</p>
          )}
        </div>

        <div className="space-y-2">
          <ActionCard title="Trigger Scan" description="Run the scanner now" onClick={handleScan} variant="orange" />
          <ActionCard title="Seed Keywords" description="Load default keywords" onClick={handleSeed} />
          <ActionCard title="Refresh Status" description="Check server health" onClick={loadHealth} />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Monitored Subreddits</h2>
        <div className="space-y-5">
          {tiers.map((t) => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[12px] font-semibold ${t.color}`}>{t.name}</span>
                <span className="text-[11px] text-white/20">{t.freq}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.subs.map((s) => (
                  <span key={s} className="text-[11px] bg-white/[0.04] text-white/35 px-2 py-1 rounded-md">
                    r/{s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Environment</h2>
        <div className="space-y-1.5 font-mono text-[12px]">
          {[
            ['MONGODB_URI', 'mongodb+srv://...'],
            ['GMAIL_APP_PASSWORD', '••••••••••••••••'],
            ['EMAIL_TO', 'guillemcastellsf@gmail.com'],
            ['DISCORD_WEBHOOK_URL', 'https://discord.com/api/webhooks/...'],
            ['MIN_RELEVANCE_SCORE', '50'],
            ['SCAN_INTERVAL_MINUTES', '10'],
          ].map(([key, val]) => (
            <div key={key} className="flex">
              <span className="text-orange-400/60 w-48 shrink-0">{key}</span>
              <span className="text-white/20 truncate">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
