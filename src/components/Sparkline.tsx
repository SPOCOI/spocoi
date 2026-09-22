export function Sparkline({ values, color = "var(--color-brand-deep)" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${24 - ((v - min) / range) * 22 - 1}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 24" width="100%" height="24" preserveAspectRatio="none" className="mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
