import type { Metadata } from "next";
import Link from "next/link";
import { PricingTiers } from "@/components/PricingTiers";

export const metadata: Metadata = {
  title: "Prețuri — spocoi",
  description:
    "Prețuri geo-adaptive pentru Moldova, România și UE, plus sesiunile voce incluse în fiecare plan spocoi.",
};

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pb-14 pt-20 text-center md:pt-28">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          Prețuri
        </span>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Prețuri adaptate acolo unde trăiești
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-soft">
          Moldova, România sau restul Uniunii Europene — alege regiunea ta și
          vezi prețul potrivit. Fără costuri ascunse.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <PricingTiers />
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">De reținut:</strong> sesiunile voce
          incluse în fiecare plan sunt conversații de câte 5 minute. Nu suntem
          încă lansați, așa că aceste prețuri pot suferi ajustări minore până
          atunci.{" "}
          <Link href="/waitlist" className="underline hover:text-ink">
            Intră pe waitlist
          </Link>{" "}
          ca să afli primul dacă se schimbă ceva.
        </div>
      </section>
    </>
  );
}
