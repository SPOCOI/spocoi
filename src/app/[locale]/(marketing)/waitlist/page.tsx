import { headers } from "next/headers";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).waitlist;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function WaitlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).waitlist;

  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <>
      <section className="mx-auto max-w-3xl px-5 pb-14 pt-20 text-center md:pt-28">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          {t.eyebrow}
        </span>
        <h1 className="mt-3 text-balance text-[clamp(1.75rem,1.2rem+3vw,3rem)] font-semibold leading-tight tracking-tight">
          {t.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-soft">{t.sub}</p>

        <div className="mx-auto mt-9 max-w-md">
          <WaitlistForm locale={locale} region={region} />
          <p className="mt-4 text-xs text-ink-faint">{t.formHint}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {t.tiers.map((tier, i) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-pale text-sm font-semibold text-brand-deep">
                {i + 1}
              </div>
              <div className="font-semibold">{tier.name}</div>
              <div className="mt-1 text-xs text-ink-faint">{tier.range}</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{tier.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-paper p-6 text-center text-sm leading-relaxed text-ink-soft">
          {t.sameForEveryone}{" "}
          <Link href={localizedHref("/pricing", locale)} className="underline hover:text-ink">
            {t.sameForEveryoneLink}
          </Link>
          .
        </div>
      </section>
    </>
  );
}
