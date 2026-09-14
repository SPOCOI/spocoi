import type { ReactNode } from "react";
import { getCrisisResources } from "@/lib/crisis";
import type { Region } from "@/lib/region";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/**
 * Shared chrome for the three legal pages (privacy, terms, ai-disclaimer):
 * title + "last updated", a draft-status notice, the crisis/emergency
 * block, and a typographic wrapper for long-form prose content.
 *
 * The draft notice and the crisis block are deliberately separate elements
 * (not merged into one box) — the crisis content needs to read as fully
 * serious and immediate, not softened by sitting next to "this is a draft".
 */

const containerClass = "mx-auto max-w-[65ch] px-5";

export function LegalPage({
  title,
  updated,
  region,
  locale,
  children,
}: {
  title: string;
  updated: string;
  region: Region;
  locale: Locale;
  children: ReactNode;
}) {
  const t = getDictionary(locale).legal;

  return (
    <article className="pb-24">
      <header className={`${containerClass} pt-16 pb-2`}>
        <span className="text-xs font-medium uppercase tracking-wide text-brand-deep">
          {t.eyebrow}
        </span>
        <h1 className="mt-3 text-balance text-[clamp(1.5rem,0.9rem+2.5vw,2.25rem)] font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-ink-faint">
          {t.updatedLabel} {updated}
        </p>
      </header>

      <div className={`${containerClass} mt-8`}>
        <DraftNotice locale={locale} />
      </div>

      <div className={`${containerClass} mt-5`}>
        <CrisisNotice region={region} locale={locale} />
      </div>

      <div
        className={`${containerClass} mt-12 text-[15px] leading-relaxed text-ink-soft
          [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:text-ink [&>h2]:first:mt-0
          [&>p]:mt-4 [&>p+p]:mt-4
          [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5
          [&>ol]:mt-4 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-5
          [&_strong]:font-semibold [&_strong]:text-ink
          [&_a]:text-brand-deep [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ink`}
      >
        {children}
      </div>
    </article>
  );
}

function DraftNotice({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).legal;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-soft">
      <strong className="text-ink">{t.draftNoticeStrong}</strong> {t.draftNoticeBody}
    </div>
  );
}

function CrisisNotice({ region, locale }: { region: Region; locale: Locale }) {
  const t = getDictionary(locale).legal;
  const resources = getCrisisResources(region, locale);

  return (
    <div className="rounded-2xl border-2 border-ink/70 bg-surface p-6 text-sm leading-relaxed text-ink-soft">
      <p className="font-semibold text-ink">{t.crisisTitle}</p>
      <p className="mt-2">{t.crisisBody}</p>
      <ul className="mt-3 space-y-1">
        <li>
          <strong className="text-ink">{t.emergencyLabel}</strong> {resources.emergency}
        </li>
        {resources.lines.map((line) => (
          <li key={line.label}>
            <strong className="text-ink">{line.label}:</strong> {line.number}
          </li>
        ))}
      </ul>
      {resources.note && <p className="mt-3">{resources.note}</p>}
      <p className="mt-3 text-ink-faint">{t.crisisFallback}</p>
    </div>
  );
}
