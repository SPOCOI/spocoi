import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { REGION_HEADER, resolveRegion } from "@/lib/region";

export function proxy(request: NextRequest) {
  const { country } = geolocation(request);
  const region = resolveRegion(country);

  const headers = new Headers(request.headers);
  headers.set(REGION_HEADER, region);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/pricing",
};
