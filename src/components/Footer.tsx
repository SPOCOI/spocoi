import Link from "next/link";
import { Logo } from "./Logo";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref, type Locale } from "@/i18n/config";

const socials = [
  { href: "https://instagram.com/spocoi", label: "Instagram" },
  { href: "https://www.tiktok.com/@spocoi", label: "TikTok" },
];

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;

  const legal = [
    { href: localizedHref("/legal/privacy", locale), label: t.privacy },
    { href: localizedHref("/legal/terms", locale), label: t.terms },
    { href: localizedHref("/legal/ai-disclaimer", locale), label: t.aiDisclaimer },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t.blurb}</p>
        </div>

        <div className="flex gap-16">
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {t.social}
            </div>
            <ul className="flex flex-col gap-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ink-soft hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {t.legal}
            </div>
            <ul className="flex flex-col gap-2">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-xs text-ink-faint">
        {t.rights(new Date().getFullYear())}
      </div>
    </footer>
  );
}
