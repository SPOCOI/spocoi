import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { geolocation } from "@vercel/functions";
import { REGION_HEADER, resolveRegion } from "@/lib/region";
import { defaultLocale } from "@/i18n/config";

export async function proxy(request: NextRequest) {
  const { country } = geolocation(request);
  const region = resolveRegion(country);

  const headers = new Headers(request.headers);
  headers.set(REGION_HEADER, region);

  const { pathname } = request.nextUrl;
  const hasLocalePrefix = pathname === "/en" || pathname.startsWith("/en/");

  let rewrittenUrl: URL | null = null;
  if (!hasLocalePrefix) {
    // Default locale (ro) is served unprefixed — rewrite internally to /ro/*
    // so the [locale] route segment still resolves, without changing the URL bar.
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    rewrittenUrl = url;
  }

  let response = rewrittenUrl
    ? NextResponse.rewrite(rewrittenUrl, { request: { headers } })
    : NextResponse.next({ request: { headers } });

  // Refresh the Supabase auth session on every request that passes through
  // here — Server Components can read cookies but can't write them, so
  // without this, sessions would silently go stale.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = rewrittenUrl
            ? NextResponse.rewrite(rewrittenUrl, { request: { headers } })
            : NextResponse.next({ request: { headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
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
    "/login",
    "/signup",
    "/account",
    "/admin",
    "/en",
    "/en/pricing",
    "/en/waitlist",
    "/en/legal/ai-disclaimer",
    "/en/legal/privacy",
    "/en/account",
    "/en/admin",
    "/en/legal/terms",
    "/en/chat",
    "/en/login",
    "/en/signup",
  ],
};
