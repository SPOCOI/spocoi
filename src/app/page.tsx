import { headers } from "next/headers";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { getCrisisResources } from "@/lib/crisis";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";

const topics = [
  {
    title: "Nimeni nu te repede să „treci peste”",
    body: "Poți vorbi despre o zi grea, o relație toxică, anxietate sau doar despre singurătate — fără să ți se spună să te descurci sau să nu te mai gândești la asta.",
  },
  {
    title: "Vorbești sau scrii — cum ai chef azi",
    body: "Unele zile vrei să vorbești cu voce tare, altele doar să scrii în liniște. Alegi tu, iar conversația continuă exact de unde ai lăsat-o.",
  },
  {
    title: "În limba ta, nu tradus stângaci",
    body: "Multe aplicații sunt gândite pentru alte piețe și traduse ulterior. spocoi vorbește românește de la bază, nu ca o adaptare de ultim moment.",
  },
  {
    title: "Ce spui rămâne între noi",
    body: "Conversațiile sunt criptate, iar datele stau pe servere din Uniunea Europeană — nu pleacă în afara ei.",
  },
];

const waitlistTiers = [
  { name: "Fondator", range: "primii 100" },
  { name: "Pioneer", range: "101–500" },
  { name: "Early Adopter", range: "501–1000" },
];

export default async function Home() {
  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);
  const crisis = getCrisisResources(region);
  const crisisLine = crisis.lines[0];

  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-20 text-center md:pt-28">
        <div className="mb-8 flex justify-center">
          <LogoMark className="h-14 w-14" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          Făcut pentru Moldova, România și diaspora
        </span>
        <h1 className="mt-3 text-balance text-[clamp(1.875rem,1rem+4vw,3.75rem)] font-semibold leading-tight tracking-tight">
          Vorbește despre ce te apasă,
          <br />
          <span className="text-brand-deep">oricând ai nevoie</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-soft">
          Un psiholog bun e scump și greu de găsit acasă. spocoi ascultă
          oricând ai nevoie, fără liste de așteptare și fără costuri pe care
          nu ți le permiți.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/waitlist"
            className="w-full rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] sm:w-auto"
          >
            Intră pe waitlist
          </Link>
          <Link
            href="/pricing"
            className="w-full rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface sm:w-auto"
          >
            Vezi prețurile
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-faint">
          Nu suntem încă lansați — construim SPOCOI acum și primii 1000 de
          oameni de pe waitlist primesc acces prioritar.
        </p>
      </section>

      <section id="features" className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
              Ce faci pe spocoi
            </span>
            <h2 className="mt-3 text-balance text-[clamp(1.5rem,0.6rem+2.2vw,2.25rem)] font-semibold tracking-tight">
              Nu e un chatbot generic. E gândit pentru momentele grele.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {topics.map((t) => (
              <div key={t.title} className="bg-paper p-7">
                <h3 className="text-base font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">Important:</strong> spocoi nu
          înlocuiește un psiholog sau psihiatru licențiat și nu e un serviciu
          de urgență. Dacă treci printr-o criză, sună la {crisis.emergency}
          {crisisLine ? <> sau la {crisisLine.label.toLowerCase()} ({crisisLine.number})</> : null}
          , sau contactează un specialist.{" "}
          <Link href="/legal/ai-disclaimer" className="underline hover:text-ink">
            Detalii despre limitele AI-ului
          </Link>
          .
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 text-center">
        <h2 className="text-balance text-[clamp(1.5rem,0.9rem+2.5vw,2.25rem)] font-semibold tracking-tight">
          Waitlist-ul are 3 niveluri
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Cu cât te înscrii mai devreme, cu atât primești acces și beneficii
          mai bune la lansare.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {waitlistTiers.map((tier, i) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-pale text-sm font-semibold text-brand-deep">
                {i + 1}
              </div>
              <div className="font-semibold">{tier.name}</div>
              <div className="mt-1 text-xs text-ink-faint">{tier.range}</div>
            </div>
          ))}
        </div>
        <Link
          href="/waitlist"
          className="mt-10 inline-block rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          Rezervă-ți locul
        </Link>
      </section>
    </>
  );
}
