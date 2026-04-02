export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total posts', value: stats.totalPosts },
    { label: 'Today', value: stats.todayPosts },
    { label: 'This week', value: stats.weekPosts },
    { label: 'Response rate', value: `${stats.responseRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-neutral-200 p-6">
          <p className="text-3xl font-bold text-neutral-900 tabular-nums">{card.value}</p>
          <p className="text-sm text-neutral-400 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
