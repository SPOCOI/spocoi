import type { Region } from "@/lib/region";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const priceTable: Record<string, Record<Region, number>> = {
  free: { MD: 0, RO: 0, UE: 0 },
  simplu: { MD: 2.99, RO: 4.99, UE: 6.99 },
  plus: { MD: 6.99, RO: 9.99, UE: 14.99 },
  avansat: { MD: 14.99, RO: 19.99, UE: 29.99 },
};

export function PricingTiers({ region, locale }: { region: Region; locale: Locale }) {
  const t = getDictionary(locale).pricing;

  function formatPrice(value: number) {
    if (value === 0) return t.free;
    return `$${value.toFixed(2)}`;
  }

  return (
    <div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.tiers.map((tier) => {
          const price = priceTable[tier.id][region];
          const isPopular = tier.id === "plus";
          return (
            <div
              key={tier.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                isPopular ? "border-brand bg-brand-pale/40" : "border-line bg-surface"
              }`}
            >
              {isPopular ? (
                <span className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-deep">
                  {t.popularLabel}
                </span>
              ) : (
                <span className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
                  &nbsp;
                </span>
              )}

              <div className="text-base font-semibold">{tier.name}</div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">
                  {formatPrice(price)}
                </span>
                {price > 0 && <span className="text-sm text-ink-faint">{t.perMonth}</span>}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{tier.blurb}</p>

              <div className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
                {"sessionsLabel" in tier ? tier.sessionsLabel : t.noVoice}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-ink-faint">{t.footnote}</p>
    </div>
  );
}
