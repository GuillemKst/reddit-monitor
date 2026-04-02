const statuses = ['all', 'new', 'seen', 'responded', 'dismissed'];

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="bg-white/[0.04] border border-white/[0.08] text-white/80 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40 appearance-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, subreddits = [], onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value === 'all' ? '' : value });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
      <SelectField label="Status" value={filters.status || 'all'} onChange={(e) => handleChange('status', e.target.value)}>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </SelectField>

      <SelectField label="Subreddit" value={filters.subreddit || 'all'} onChange={(e) => handleChange('subreddit', e.target.value)}>
        <option value="all">All</option>
        {subreddits.map((s) => (
          <option key={s} value={s}>r/{s}</option>
        ))}
      </SelectField>

      <div className="flex items-center gap-2">
        <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Min</label>
        <input
          type="number"
          min="0"
          max="100"
          value={filters.minScore || ''}
          onChange={(e) => handleChange('minScore', e.target.value)}
          placeholder="0"
          className="bg-white/[0.04] border border-white/[0.08] text-white/80 text-xs rounded-lg px-2.5 py-1.5 w-14 focus:outline-none focus:ring-1 focus:ring-orange-500/40 tabular-nums"
        />
      </div>

      <SelectField label="Sort" value={filters.sort || '-relevanceScore'} onChange={(e) => handleChange('sort', e.target.value)}>
        <option value="-relevanceScore">Highest Score</option>
        <option value="-createdAt">Newest</option>
        <option value="-score">Most Upvotes</option>
        <option value="-numComments">Most Comments</option>
      </SelectField>
    </div>
  );
}
