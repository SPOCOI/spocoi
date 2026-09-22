"use client";

import { useState } from "react";
import { submitPricingTest } from "@/app/actions/pricing-test";
import type { Region } from "@/lib/region";

const CURRENT_PRICE: Record<Region, number> = { MD: 14.99, RO: 19.99, UE: 29.99 };
const CURRENCY_HINT: Record<Region, string> = { MD: "$", RO: "$", UE: "$" };

export function PricingTestForm() {
  const [region, setRegion] = useState<Region>("MD");
  const [tooCheap, setTooCheap] = useState("");
  const [bargain, setBargain] = useState("");
  const [expensive, setExpensive] = useState("");
  const [tooExpensive, setTooExpensive] = useState("");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tooCheap || !bargain || !expensive || !tooExpensive) return;

    setStatus("submitting");
    const result = await submitPricingTest(
      region,
      Number(tooCheap),
      Number(bargain),
      Number(expensive),
      Number(tooExpensive),
      feedback,
      email,
    );
    setStatus(result.status === "ok" ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-semibold text-ink">Mulțumim pentru răspuns.</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          Ne ajută enorm să stabilim un preț corect pentru AVANSAT.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Unde locuiești?</label>
        <div className="flex gap-2">
          {(["MD", "RO", "UE"] as Region[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                region === r
                  ? "border-brand bg-brand text-ink"
                  : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {r === "MD" ? "Moldova" : r === "RO" ? "România" : "Restul UE"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-soft">
        Prețul curent al AVANSAT în regiunea ta e{" "}
        <span className="font-semibold text-ink">
          {CURRENCY_HINT[region]}
          {CURRENT_PRICE[region].toFixed(2)}/lună
        </span>
        . Răspunde la întrebările de mai jos gândindu-te la acest tier: 20 de sesiuni de voce × 5
        min pe lună, plus conversații text nelimitate.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PriceField
          label="La ce preț ar fi o afacere bună?"
          hint="Simți că faci o afacere bună"
          value={bargain}
          onChange={setBargain}
        />
        <PriceField
          label="La ce preț ar începe să se simtă scump?"
          hint="Scump, dar tot l-ai lua în considerare"
          value={expensive}
          onChange={setExpensive}
        />
        <PriceField
          label="La ce preț l-ai considera prea ieftin?"
          hint="Te-ai îndoi de calitate"
          value={tooCheap}
          onChange={setTooCheap}
        />
        <PriceField
          label="La ce preț l-ai considera prea scump?"
          hint="Nu l-ai mai lua în considerare deloc"
          value={tooExpensive}
          onChange={setTooExpensive}
        />
      </div>

      <div>
        <label htmlFor="feedback" className="mb-1.5 block text-sm font-medium text-ink">
          Ceva ce vrei să adaugi? (opțional)
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Orice gând despre preț, valoare, sau ce lipsește"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email (opțional, doar dacă vrei să revenim la tine)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="tu@exemplu.com"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Se trimite..." : "Trimite răspunsul"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Ceva n-a mers bine. Mai încearcă o dată.
        </p>
      )}
    </form>
  );
}

function PriceField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <p className="mb-1.5 text-xs text-ink-faint">{hint}</p>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
          $
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper py-2 pl-6 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
    </div>
  );
}
