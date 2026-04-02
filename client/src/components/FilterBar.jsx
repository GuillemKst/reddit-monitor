const statuses = ['all', 'new', 'seen', 'responded', 'dismissed'];

export default function FilterBar({ filters, subreddits = [], onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value === 'all' ? '' : value });
  }

  const selectClass = 'bg-white border border-neutral-200 text-neutral-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-300 appearance-none cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={filters.status || 'all'} onChange={(e) => handleChange('status', e.target.value)} className={selectClass}>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>

      <select value={filters.subreddit || 'all'} onChange={(e) => handleChange('subreddit', e.target.value)} className={selectClass}>
        <option value="all">All subreddits</option>
        {subreddits.map((s) => (
          <option key={s} value={s}>r/{s}</option>
        ))}
      </select>

      <select value={filters.sort || '-relevanceScore'} onChange={(e) => handleChange('sort', e.target.value)} className={selectClass}>
        <option value="-relevanceScore">Highest score</option>
        <option value="-createdAt">Newest</option>
        <option value="-score">Most upvotes</option>
        <option value="-numComments">Most comments</option>
      </select>
    </div>
  );
}
