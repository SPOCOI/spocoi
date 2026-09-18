import Link from "next/link";
import type { Region } from "@/lib/region";
import { localizedHref, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PricingCheckoutButton } from "@/components/PricingCheckoutButton";
import type { PaidTier } from "@/lib/stripe";

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

              <div className="mt-5">
                {tier.id === "free" ? (
                  <Link
                    href={localizedHref("/signup", locale)}
                    className="block w-full rounded-full border border-line px-5 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    {t.freeButton}
                  </Link>
                ) : (
                  <PricingCheckoutButton
                    tier={tier.id as PaidTier}
                    locale={locale}
                    label={t.chooseButton}
                    redirectingLabel={t.redirecting}
                    errorLabel={t.checkoutError}
                    className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${
                      isPopular ? "bg-brand text-ink" : "border border-line text-ink hover:bg-paper"
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-ink-faint">{t.footnote}</p>
    </div>
  );
}
