export default function BadgeRelevance({ score }) {
  let color = 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30';
  if (score >= 70) color = 'bg-red-500/15 text-red-400 ring-red-500/30';
  else if (score >= 50) color = 'bg-amber-500/15 text-amber-400 ring-amber-500/30';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ${color}`}
    >
      {score}
    </span>
  );
}
