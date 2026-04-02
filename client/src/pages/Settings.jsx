import { useState, useEffect } from 'react';
import { fetchHealth, triggerScan, seedKeywords } from '../api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    setIsLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }

  function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }

  async function handleAction(action) {
    setActionMessage('');
    try {
      if (action === 'scan') {
        await triggerScan();
        setActionMessage('Scan triggered successfully. Results will appear in the dashboard shortly.');
      } else if (action === 'seed') {
        const res = await seedKeywords();
        setActionMessage(res.message);
      }
    } catch (err) {
      setActionMessage(`Error: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {actionMessage && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm px-4 py-3 rounded-xl">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
          {isLoading ? (
            <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" />
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Uptime</span>
                <span className="text-sm text-gray-200">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Check</span>
                <span className="text-sm text-gray-200">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-red-400 text-sm">Could not connect to server</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleAction('scan')}
              className="w-full bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-sm font-medium px-4 py-3 rounded-lg transition-colors text-left"
            >
              🔄 Trigger Manual Scan
              <span className="block text-xs text-orange-400/60 mt-0.5">
                Run the scanner immediately
              </span>
            </button>
            <button
              onClick={() => handleAction('seed')}
              className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium px-4 py-3 rounded-lg transition-colors text-left"
            >
              🌱 Seed Default Keywords
              <span className="block text-xs text-emerald-400/60 mt-0.5">
                Load pre-configured keywords for screen recording
              </span>
            </button>
            <button
              onClick={loadHealth}
              className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium px-4 py-3 rounded-lg transition-colors text-left"
            >
              🩺 Check Health
              <span className="block text-xs text-blue-400/60 mt-0.5">
                Refresh server status
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
        <p className="text-sm text-gray-400 mb-4">
          These settings are configured via environment variables in the <code className="text-orange-400 bg-gray-800 px-1.5 py-0.5 rounded">.env</code> file.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 font-mono text-xs">
          <p className="text-gray-400">
            <span className="text-blue-400">MONGODB_URI</span>=mongodb://localhost:27017/reddit-monitor
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">DISCORD_WEBHOOK_URL</span>=https://discord.com/api/webhooks/...
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">SCAN_INTERVAL_MINUTES</span>=10
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">MIN_RELEVANCE_SCORE</span>=40
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">REDDIT_USER_AGENT</span>=RedditMonitor/1.0
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">EMAIL_FROM</span>=alerts@yourdomain.com
          </p>
          <p className="text-gray-400">
            <span className="text-blue-400">EMAIL_TO</span>=you@email.com
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Monitored Subreddits</h2>
        <div className="space-y-4">
          {[
            { tier: 'Tier 1 — High', subs: ['SaaS', 'startups', 'Entrepreneur', 'webdev', 'programming', 'software', 'productivity', 'remotework'], color: 'text-red-400', freq: 'Every 10 min' },
            { tier: 'Tier 2 — Medium', subs: ['smallbusiness', 'freelance', 'digital_marketing', 'MacApps', 'windows', 'linux', 'WorkOnline', 'telecommuting'], color: 'text-amber-400', freq: 'Every 30 min' },
            { tier: 'Tier 3 — Niche', subs: ['DevTools', 'selfhosted', 'SideProject', 'AskTechnology', 'techsupport', 'youtubers', 'NewTubers'], color: 'text-emerald-400', freq: 'Every 60 min' },
          ].map((t) => (
            <div key={t.tier}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${t.color}`}>{t.tier}</h3>
                <span className="text-xs text-gray-500">{t.freq}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.subs.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-lg"
                  >
                    r/{s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
