import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Waitlist — spocoi",
  description:
    "Intră pe waitlist-ul spocoi în 3 niveluri — Fondator, Pioneer, Early Adopter — și primești acces printre primii la lansare.",
};

const tiers = [
  {
    name: "Fondator",
    range: "primii 100",
    body: "Primul grup de oameni care intră pe waitlist. Acces printre primii la lansare și șansa să ne spui direct ce funcționează și ce nu, cât încă construim produsul.",
  },
  {
    name: "Pioneer",
    range: "locurile 101–500",
    body: "Acces prioritar la lansare, imediat după grupul Fondator — printre primii care încearcă spocoi înainte de publicul larg.",
  },
  {
    name: "Early Adopter",
    range: "locurile 501–1000",
    body: "Faci parte din primul val de 1000 de oameni care testează spocoi, cu acces înaintea lansării publice generale.",
  },
];

export default function WaitlistPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-5 pb-14 pt-20 text-center md:pt-28">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          Waitlist
        </span>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Rezervă-ți locul înainte de lansare
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-soft">
          Waitlist-ul spocoi are 3 niveluri. Cu cât te înscrii mai devreme, cu
          atât ești mai aproape de primul grup care are acces la produs.
        </p>

        <div className="mx-auto mt-9 max-w-md">
          <WaitlistForm />
          <p className="mt-4 text-xs text-ink-faint">
            Nu trimitem spam. Doar te anunțăm când e rândul tău.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-pale text-sm font-semibold text-brand-deep">
                {i + 1}
              </div>
              <div className="font-semibold">{tier.name}</div>
              <div className="mt-1 text-xs text-ink-faint">{tier.range}</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {tier.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-paper p-6 text-center text-sm leading-relaxed text-ink-soft">
          Nivelurile de mai sus țin de ordinea înscrierii, nu de un preț
          diferit — modelul de prețuri e{" "}
          <Link href="/pricing" className="underline hover:text-ink">
            același pentru toată lumea, adaptat regiunii tale
          </Link>
          .
        </div>
      </section>
    </>
  );
}
