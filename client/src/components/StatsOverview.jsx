const icons = {
  total: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  today: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  week: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  rate: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

function Icon({ d }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: icons.total, color: 'text-blue-400' },
    { label: 'Today', value: stats.todayPosts, icon: icons.today, color: 'text-orange-400' },
    { label: 'This Week', value: stats.weekPosts, icon: icons.week, color: 'text-violet-400' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: icons.rate, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors"
        >
          <div className={`${card.color} mb-3 opacity-60`}>
            <Icon d={card.icon} />
          </div>
          <p className="text-xl font-bold text-white tabular-nums">{card.value}</p>
          <p className="text-[11px] text-white/30 mt-0.5 font-medium uppercase tracking-wider">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
