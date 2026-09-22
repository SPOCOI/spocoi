const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: "var(--color-line)", text: "var(--color-ink-soft)", label: "FREE" },
  simplu: { bg: "var(--color-tier-simplu-bg)", text: "var(--color-tier-simplu-text)", label: "SIMPLU" },
  plus: { bg: "var(--color-tier-plus-bg)", text: "var(--color-tier-plus-text)", label: "PLUS" },
  avansat: { bg: "var(--color-tier-avansat-bg)", text: "var(--color-tier-avansat-text)", label: "AVANSAT" },
};

export function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.free;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
