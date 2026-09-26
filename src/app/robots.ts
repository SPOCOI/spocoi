import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://spocoi.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/chat", "/api", "/pret-test", "/dezabonare"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
