import { useState, useEffect, useCallback } from 'react';
import CardPost from '../components/CardPost';
import FilterBar from '../components/FilterBar';
import StatsOverview from '../components/StatsOverview';
import { fetchPosts, fetchStats, fetchSubreddits, triggerScan } from '../api';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [subreddits, setSubreddits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    subreddit: '',
    minScore: '',
    sort: '-relevanceScore',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.subreddit) params.subreddit = filters.subreddit;
      if (filters.minScore) params.minScore = filters.minScore;
      if (filters.sort) params.sort = filters.sort;

      const [postsData, statsData, subsData] = await Promise.all([
        fetchPosts(params),
        fetchStats(),
        fetchSubreddits(),
      ]);

      setPosts(postsData.posts);
      setPagination(postsData.pagination);
      setStats(statsData);
      setSubreddits(subsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
    setIsLoading(false);
  }, [filters, pagination.page]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleStatusChange(postId, newStatus) {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, status: newStatus } : p)));
  }

  async function handleTriggerScan() {
    setIsScanning(true);
    try {
      await triggerScan();
      setTimeout(loadData, 5000);
    } catch (err) { console.error(err); }
    setIsScanning(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-white/30 mt-0.5">
            {pagination.total} opportunities detected
          </p>
        </div>
        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/40 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isScanning ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      <StatsOverview stats={stats} />
      <FilterBar
        filters={filters}
        subreddits={subreddits}
        onChange={(f) => { setFilters(f); setPagination((p) => ({ ...p, page: 1 })); }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-[13px] text-white/30">No posts match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <CardPost key={post._id} post={post} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1}
            className="text-xs text-white/40 hover:text-white/70 disabled:text-white/10 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-white/20 tabular-nums">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
            disabled={pagination.page >= pagination.pages}
            className="text-xs text-white/40 hover:text-white/70 disabled:text-white/10 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {stats?.topSubreddits?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Top Subreddits</h3>
            <div className="space-y-2.5">
              {stats.topSubreddits.map((s, i) => (
                <div key={s._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/15 font-mono w-4">{i + 1}</span>
                    <span className="text-xs text-white/60">r/{s._id}</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/30 tabular-nums">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {stats?.topKeywords?.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Top Keywords</h3>
              <div className="space-y-2.5">
                {stats.topKeywords.map((k, i) => (
                  <div key={k._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/15 font-mono w-4">{i + 1}</span>
                      <span className="text-xs text-white/60">{k._id}</span>
                    </div>
                    <span className="text-[11px] font-medium text-white/30 tabular-nums">{k.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
