"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitch } from "./LanguageSwitch";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref, type Locale } from "@/i18n/config";

export function NavBar({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale).nav;

  const links = [
    { href: localizedHref("/#features", locale), label: t.features },
    { href: localizedHref("/pricing", locale), label: t.pricing },
  ];
  const waitlistHref = localizedHref("/waitlist", locale);
  const homeHref = localizedHref("/", locale);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={homeHref} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch locale={locale} />
          <ThemeToggle />
          <Link
            href={waitlistHref}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            {t.waitlist}
          </Link>
        </div>

        <button
          aria-label={t.menu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-3 border-t border-line px-5 pb-5 pt-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-surface hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3">
            <LanguageSwitch locale={locale} />
            <ThemeToggle />
          </div>
          <Link
            href={waitlistHref}
            onClick={() => setOpen(false)}
            className="mt-1 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            {t.waitlist}
          </Link>
        </nav>
      )}
    </header>
  );
}
