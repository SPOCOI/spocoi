// Shadow-circle offset per phase (0 = new moon, 6 = full) — see the
// mockup this was designed from. The shadow's fill must match whatever
// sits directly behind it for the crescent illusion to read correctly.
const SHADOW_X = [12, 15, 18, 21, 24, 27, 30];

export function MoonPhase({
  phase,
  size = 20,
  shadowColor = "var(--chat-bg)",
  className = "",
}: {
  phase: number;
  size?: number;
  shadowColor?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(6, phase));
  const shadowX = SHADOW_X[clamped];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" fill="var(--color-brand)" />
      <circle cx={shadowX} cy="12" r="9" style={{ fill: shadowColor }} />
    </svg>
  );
}
