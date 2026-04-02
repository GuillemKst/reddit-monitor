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

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleStatusChange(postId, newStatus) {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, status: newStatus } : p))
    );
  }

  async function handleTriggerScan() {
    setIsScanning(true);
    try {
      await triggerScan();
      setTimeout(loadData, 5000);
    } catch (err) {
      console.error(err);
    }
    setIsScanning(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} oportunidades detectadas
          </p>
        </div>
        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          {isScanning ? 'Scanning...' : '🔄 Run Scan'}
        </button>
      </div>

      <StatsOverview stats={stats} />

      <FilterBar
        filters={filters}
        subreddits={subreddits}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">No posts found with current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <CardPost key={post._id} post={post} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1}
            className="px-4 py-2 text-sm bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
            disabled={pagination.page >= pagination.pages}
            className="px-4 py-2 text-sm bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {stats?.topSubreddits?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Subreddits</h3>
            <div className="space-y-2">
              {stats.topSubreddits.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">r/{s._id}</span>
                  <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {stats?.topKeywords?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Keywords</h3>
              <div className="space-y-2">
                {stats.topKeywords.map((k) => (
                  <div key={k._id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{k._id}</span>
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {k.count}
                    </span>
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
