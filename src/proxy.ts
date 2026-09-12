import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { REGION_HEADER, resolveRegion } from "@/lib/region";
import { defaultLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { country } = geolocation(request);
  const region = resolveRegion(country);

  const headers = new Headers(request.headers);
  headers.set(REGION_HEADER, region);

  const { pathname } = request.nextUrl;
  const hasLocalePrefix = pathname === "/en" || pathname.startsWith("/en/");

  if (!hasLocalePrefix) {
    // Default locale (ro) is served unprefixed — rewrite internally to /ro/*
    // so the [locale] route segment still resolves, without changing the URL bar.
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/",
    "/pricing",
    "/waitlist",
    "/legal/ai-disclaimer",
    "/legal/privacy",
    "/legal/terms",
    "/chat",
    "/en",
    "/en/pricing",
    "/en/waitlist",
    "/en/legal/ai-disclaimer",
    "/en/legal/privacy",
    "/en/legal/terms",
    "/en/chat",
  ],
};
