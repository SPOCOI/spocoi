import { headers } from "next/headers";
import Link from "next/link";
import { PricingTiers } from "@/components/PricingTiers";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).pricing;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).pricing;

  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pb-6 pt-20 text-center md:pt-28">
        <p className="mx-auto max-w-lg text-balance text-sm text-ink-soft">
          {t.intro}{" "}
          <Link href={localizedHref("/#features", locale)} className="underline hover:text-ink">
            {t.introLink}
          </Link>
          .
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-14 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          {t.eyebrow}
        </span>
        <h1 className="mt-3 text-balance text-[clamp(1.75rem,1.2rem+3vw,3rem)] font-semibold leading-tight tracking-tight">
          {t.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-soft">{t.sub}</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <PricingTiers region={region} locale={locale} />
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">{t.noteStrong}</strong> {t.noteBody}{" "}
          <Link href={localizedHref("/waitlist", locale)} className="underline hover:text-ink">
            {t.noteLink}
          </Link>{" "}
          {t.noteAfterLink}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-7 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">{t.geoStrong}</strong> {t.geoBody}{" "}
          <a href="mailto:support@spocoi.co" className="underline hover:text-ink">
            support@spocoi.co
          </a>{" "}
          {t.geoAfterEmail}{" "}
          <Link href={localizedHref("/legal/privacy", locale)} className="underline hover:text-ink">
            {t.geoLink}
          </Link>
          .
        </div>
      </section>
    </>
  );
}
