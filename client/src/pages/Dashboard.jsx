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
    minScore: '60',
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {pagination.total} opportunities found
          </p>
        </div>
        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="text-[13px] font-medium bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isScanning ? 'Scanning...' : 'Run scan'}
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
          <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-neutral-400">No posts match your filters</p>
        </div>
      ) : (
        <div className="border border-neutral-100 rounded-xl px-5">
          {posts.map((post) => (
            <CardPost key={post._id} post={post} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1}
            className="text-[13px] text-neutral-400 hover:text-neutral-900 disabled:text-neutral-200 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[13px] text-neutral-300 tabular-nums">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
            disabled={pagination.page >= pagination.pages}
            className="text-[13px] text-neutral-400 hover:text-neutral-900 disabled:text-neutral-200 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {(stats?.topSubreddits?.length > 0 || stats?.topKeywords?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
          {stats?.topSubreddits?.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Top subreddits</h3>
              <div className="space-y-2">
                {stats.topSubreddits.map((s) => (
                  <div key={s._id} className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-600">r/{s._id}</span>
                    <span className="text-[13px] text-neutral-300 tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats?.topKeywords?.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Top keywords</h3>
              <div className="space-y-2">
                {stats.topKeywords.map((k) => (
                  <div key={k._id} className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-600">{k._id}</span>
                    <span className="text-[13px] text-neutral-300 tabular-nums">{k.count}</span>
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
