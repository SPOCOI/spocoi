import type { MetadataRoute } from "next";
import { locales, localizedHref } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://spocoi.com";

// Only public, indexable marketing pages — /chat, /account, /admin are
// behind auth (or internal), and /pret-test, /dezabonare are already
// noindex, so none of them belong in a sitemap meant to drive crawling.
const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/waitlist",
  "/legal/privacy",
  "/legal/terms",
  "/legal/ai-disclaimer",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_PATHS) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}${localizedHref(path, locale)}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
