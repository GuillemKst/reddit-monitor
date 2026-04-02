export default function BadgeRelevance({ score }) {
  let style;
  if (score >= 80) {
    style = 'bg-neutral-900 text-white';
  } else if (score >= 60) {
    style = 'bg-neutral-100 text-neutral-700';
  } else {
    style = 'bg-neutral-50 text-neutral-400';
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded tabular-nums ${style}`}>
      {score}
    </span>
  );
}
