const statuses = ['all', 'new', 'seen', 'responded', 'dismissed'];

export default function FilterBar({ filters, subreddits = [], onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value === 'all' ? '' : value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-400">Status</label>
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-400">Subreddit</label>
        <select
          value={filters.subreddit || 'all'}
          onChange={(e) => handleChange('subreddit', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        >
          <option value="all">All</option>
          {subreddits.map((s) => (
            <option key={s} value={s}>
              r/{s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-400">Min Score</label>
        <input
          type="number"
          min="0"
          max="100"
          value={filters.minScore || ''}
          onChange={(e) => handleChange('minScore', e.target.value)}
          placeholder="0"
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 w-16 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-400">Sort</label>
        <select
          value={filters.sort || '-relevanceScore'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        >
          <option value="-relevanceScore">Highest Score</option>
          <option value="-createdAt">Newest</option>
          <option value="-score">Most Upvotes</option>
          <option value="-numComments">Most Comments</option>
        </select>
      </div>
    </div>
  );
}
