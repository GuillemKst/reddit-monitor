export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: '📊' },
    { label: 'Today', value: stats.todayPosts, icon: '📅' },
    { label: 'This Week', value: stats.weekPosts, icon: '📆' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: '✅' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
