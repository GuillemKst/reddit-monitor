export default function BadgeRelevance({ score, size = 'sm' }) {
  let bg, text, ring;
  if (score >= 70) {
    bg = 'bg-red-500/10'; text = 'text-red-400'; ring = 'ring-red-500/20';
  } else if (score >= 50) {
    bg = 'bg-amber-500/10'; text = 'text-amber-400'; ring = 'ring-amber-500/20';
  } else {
    bg = 'bg-emerald-500/10'; text = 'text-emerald-400'; ring = 'ring-emerald-500/20';
  }

  const sizeClass = size === 'lg'
    ? 'text-sm px-3 py-1 font-bold'
    : 'text-[11px] px-2 py-0.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-md ring-1 ring-inset ${bg} ${text} ${ring} ${sizeClass} tabular-nums`}>
      {score}
    </span>
  );
}
