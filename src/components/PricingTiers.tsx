"use client";

import { useState } from "react";

type Region = "MD" | "RO" | "UE";

const regions: { id: Region; label: string }[] = [
  { id: "MD", label: "Moldova" },
  { id: "RO", label: "România" },
  { id: "UE", label: "Restul UE" },
];

type Tier = {
  id: string;
  name: string;
  price: Record<Region, number>;
  sessionsLabel: string | null;
  popular?: boolean;
  blurb: string;
};

const tiers: Tier[] = [
  {
    id: "free",
    name: "FREE",
    price: { MD: 0, RO: 0, UE: 0 },
    sessionsLabel: null,
    blurb: "Pentru a încerca spocoi fără niciun cost.",
  },
  {
    id: "simplu",
    name: "SIMPLU",
    price: { MD: 2.99, RO: 4.99, UE: 6.99 },
    sessionsLabel: "1 sesiune voce × 5 min",
    blurb: "Un pas peste gratuit, cu o sesiune voce inclusă.",
  },
  {
    id: "plus",
    name: "PLUS",
    price: { MD: 6.99, RO: 9.99, UE: 14.99 },
    sessionsLabel: "5 sesiuni voce × 5 min",
    popular: true,
    blurb: "Cel mai echilibrat raport preț–sesiuni voce.",
  },
  {
    id: "avansat",
    name: "AVANSAT",
    price: { MD: 14.99, RO: 19.99, UE: 29.99 },
    sessionsLabel: "20 sesiuni voce × 5 min",
    blurb: "Pentru conversații voce frecvente, lunar.",
  },
];

function formatPrice(value: number) {
  if (value === 0) return "Gratuit";
  return `$${value.toFixed(2)}`;
}

export function PricingTiers() {
  const [region, setRegion] = useState<Region>("MD");

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              aria-pressed={region === r.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                region === r.id
                  ? "bg-brand text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col rounded-2xl border p-6 ${
              tier.popular
                ? "border-brand bg-brand-pale/40"
                : "border-line bg-surface"
            }`}
          >
            {tier.popular ? (
              <span className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-deep">
                Cel mai ales
              </span>
            ) : (
              <span className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
                &nbsp;
              </span>
            )}

            <div className="text-base font-semibold">{tier.name}</div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {formatPrice(tier.price[region])}
              </span>
              {tier.price[region] > 0 && (
                <span className="text-sm text-ink-faint">/lună</span>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {tier.blurb}
            </p>

            <div className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              {tier.sessionsLabel ?? "Fără sesiuni voce incluse"}
            </div>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-ink-faint">
        Prețurile de mai sus sunt cele curente, adaptate regiunii — sub rezerva
        unor ajustări până la lansarea oficială.
      </p>
    </div>
  );
}
