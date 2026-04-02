export default function BadgeRelevance({ score }) {
  let style;
  if (score >= 80) {
    style = 'bg-neutral-900 text-white';
  } else if (score >= 60) {
    style = 'bg-neutral-200 text-neutral-700';
  } else {
    style = 'bg-neutral-100 text-neutral-400';
  }

  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums ${style}`}>
      {score}
    </span>
  );
}
