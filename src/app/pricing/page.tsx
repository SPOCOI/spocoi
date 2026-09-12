import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { PricingTiers } from "@/components/PricingTiers";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";

export const metadata: Metadata = {
  title: "Prețuri — spocoi",
  description:
    "Prețuri geo-adaptive pentru Moldova, România și UE, plus sesiunile voce incluse în fiecare plan spocoi.",
};

export default async function PricingPage() {
  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pb-6 pt-20 text-center md:pt-28">
        <p className="mx-auto max-w-lg text-balance text-sm text-ink-soft">
          spocoi e o platformă de suport emoțional prin conversații AI, în
          română, rusă și engleză — disponibilă 24/7, ca alternativă la
          terapia tradițională, scumpă și greu de accesat.{" "}
          <Link href="/#features" className="underline hover:text-ink">
            Vezi cum funcționează
          </Link>
          .
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-14 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          Prețuri
        </span>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Prețuri adaptate acolo unde trăiești
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-soft">
          Prețul de mai jos e deja adaptat locației tale. Fără costuri
          ascunse.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <PricingTiers region={region} />
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

        <div className="mt-4 rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">De ce vezi prețul ăsta:</strong> regiunea
          ta (Moldova, România sau restul UE) e detectată automat, din adresa
          IP aproximativă a conexiunii tale — nu construim un istoric al
          locațiilor tale. Dacă folosești un VPN sau ești în roaming, se poate
          întâmpla să vezi prețul altei regiuni; scrie-ne la{" "}
          <a href="mailto:support@spocoi.co" className="underline hover:text-ink">
            support@spocoi.co
          </a>{" "}
          și clarificăm manual. Detalii complete în{" "}
          <Link href="/legal/privacy" className="underline hover:text-ink">
            Politica de confidențialitate
          </Link>
          .
        </div>
      </section>
    </>
  );
}
