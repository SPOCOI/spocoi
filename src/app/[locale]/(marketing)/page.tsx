import { headers } from "next/headers";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { getCrisisResources } from "@/lib/crisis";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).home;

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
        <h1 className="text-balance text-[clamp(1.875rem,1rem+4vw,3.75rem)] font-semibold leading-tight tracking-tight">
          {t.heroTitle1}
          <br />
          <span className="text-brand-deep">{t.heroTitle2}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-soft">
          {t.heroSub}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={localizedHref("/waitlist", locale)}
            className="w-full rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] sm:w-auto"
          >
            {t.ctaWaitlist}
          </Link>
          <Link
            href={localizedHref("/pricing", locale)}
            className="w-full rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface sm:w-auto"
          >
            {t.ctaPricing}
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-faint">{t.preLaunch}</p>
      </section>

      <section id="features" className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
              {t.featuresEyebrow}
            </span>
            <h2 className="mt-3 text-balance text-[clamp(1.5rem,0.6rem+2.2vw,2.25rem)] font-semibold tracking-tight">
              {t.featuresTitle}
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {t.topics.map((topic) => (
              <div key={topic.title} className="bg-paper p-7">
                <h3 className="text-base font-semibold">{topic.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {topic.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">{t.disclaimerStrong}</strong> {t.disclaimerBody}{" "}
          {crisis.emergency}
          {crisisLine ? (
            <>
              {" "}
              {t.disclaimerOr} {crisisLine.label.toLowerCase()} ({crisisLine.number})
            </>
          ) : null}
          {t.disclaimerElse}{" "}
          <Link href={localizedHref("/legal/ai-disclaimer", locale)} className="underline hover:text-ink">
            {t.disclaimerLink}
          </Link>
          .
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 text-center">
        <h2 className="text-balance text-[clamp(1.5rem,0.9rem+2.5vw,2.25rem)] font-semibold tracking-tight">
          {t.waitlistTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{t.waitlistSub}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {t.waitlistTiers.map((tier, i) => (
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
          href={localizedHref("/waitlist", locale)}
          className="mt-10 inline-block rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          {t.ctaReserve}
        </Link>
      </section>
    </>
  );
}
