export const locales = ["ro", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ro";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Strips a leading /en (or any non-default locale prefix) from a pathname. */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Builds the href for `basePath` (already locale-stripped) in `locale`. */
export function localizedHref(basePath: string, locale: Locale): string {
  if (locale === defaultLocale) return basePath;
  return basePath === "/" ? `/${locale}` : `/${locale}${basePath}`;
}
