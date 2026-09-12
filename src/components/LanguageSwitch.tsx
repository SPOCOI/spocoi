"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, stripLocalePrefix, localizedHref, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { ro: "RO", en: "EN" };

export function LanguageSwitch({ locale, className = "" }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  const basePath = stripLocalePrefix(pathname || "/");

  return (
    <div className={`inline-flex rounded-full border border-line p-0.5 text-xs ${className}`}>
      {locales.map((l) => (
        <Link
          key={l}
          href={localizedHref(basePath, l)}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
            l === locale ? "bg-brand text-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          {labels[l]}
        </Link>
      ))}
    </div>
  );
}
