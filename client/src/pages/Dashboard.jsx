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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-base text-neutral-400 mt-1">
            {pagination.total} opportunities found
          </p>
        </div>
        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white px-6 py-3 rounded-xl transition-colors"
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
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-[3px] border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200">
          <p className="text-lg text-neutral-400">No posts match your filters</p>
          <p className="text-sm text-neutral-300 mt-1">Try lowering the minimum score or changing the status filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <CardPost key={post._id} post={post} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-4">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 disabled:text-neutral-300 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-neutral-400 tabular-nums font-medium">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
            disabled={pagination.page >= pagination.pages}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 disabled:text-neutral-300 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {(stats?.topSubreddits?.length > 0 || stats?.topKeywords?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {stats?.topSubreddits?.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-5">Top subreddits</h3>
              <div className="space-y-3">
                {stats.topSubreddits.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-300 font-mono w-5 text-right">{i + 1}</span>
                      <span className="text-sm font-medium text-neutral-700">r/{s._id}</span>
                    </div>
                    <span className="text-sm text-neutral-400 tabular-nums font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats?.topKeywords?.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-5">Top keywords</h3>
              <div className="space-y-3">
                {stats.topKeywords.map((k, i) => (
                  <div key={k._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-300 font-mono w-5 text-right">{i + 1}</span>
                      <span className="text-sm font-medium text-neutral-700">{k._id}</span>
                    </div>
                    <span className="text-sm text-neutral-400 tabular-nums font-medium">{k.count}</span>
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
