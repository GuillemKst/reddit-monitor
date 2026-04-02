export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total', value: stats.totalPosts },
    { label: 'Today', value: stats.todayPosts },
    { label: 'This week', value: stats.weekPosts },
    { label: 'Response rate', value: `${stats.responseRate}%` },
  ];

  return (
    <div className="grid grid-cols-4 gap-px bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
      {cards.map((card) => (
        <div key={card.label} className="bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{card.value}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
