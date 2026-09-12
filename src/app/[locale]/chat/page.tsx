import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).chat;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default async function ChatPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).chat;

  return (
    <div
      className="chat-shell flex min-h-screen flex-col"
      style={{ background: "var(--chat-bg)" }}
    >
      <header
        className="sticky top-0 z-10 border-b border-line/60 backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--chat-bg) 88%, transparent)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href={localizedHref("/", locale)} className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-pulse rounded-full bg-brand/25" />
              <LogoMark className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-ink">{t.backLabel}</span>
              <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {t.statusListening}
              </span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pt-4">
        <span className="inline-block rounded-full border border-line px-3 py-1 text-xs text-ink-faint">
          {t.previewBadge}
        </span>
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-6">
        {t.messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex flex-col items-end gap-1.5">
              <div
                className="max-w-[80%] rounded-2xl rounded-br-sm border border-line px-4 py-2.5 text-[15px] leading-relaxed text-ink"
                style={{ background: "var(--chat-surface)" }}
              >
                {m.text}
              </div>
              <span className="pr-1 text-xs text-ink-faint">{m.time}</span>
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="max-w-[85%] text-[15px] leading-relaxed text-ink-soft">{m.text}</p>
              <span className="text-xs text-ink-faint">{m.time}</span>
            </div>
          ),
        )}
      </main>

      <footer
        className="sticky bottom-0 border-t border-line/60 px-5 py-4"
        style={{ background: "color-mix(in srgb, var(--chat-bg) 92%, transparent)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2.5">
          <div
            className="flex flex-1 items-center rounded-full border border-line px-4 py-3"
            style={{ background: "var(--chat-surface)" }}
          >
            <input
              type="text"
              placeholder={t.inputPlaceholder}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              readOnly
            />
          </div>
          <button
            type="button"
            aria-label={t.micLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
