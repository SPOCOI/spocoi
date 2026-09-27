import type { NextConfig } from "next";

// script-src needs 'unsafe-inline': Next.js's App Router injects its own
// inline <script> tags to stream/hydrate the RSC payload on every page, not
// just our one theme-init script (which was externalized to
// /public/theme-init.js anyway, on general principle). Verified locally:
// a strict script-src with no 'unsafe-inline' broke hydration entirely
// (InvariantError from Next's own runtime). Closing this gap for real needs
// per-request nonce middleware wired through proxy.ts — riskier to do
// quickly since proxy.ts's matcher also drives locale rewriting and must
// never touch /api/* (Stripe/campaign webhooks) — left as a follow-up.
// Style-src keeps 'unsafe-inline' for the same reason as scripts, plus
// several components render dynamic React `style={{...}}` attributes
// (mood-phase shading, chart widths) that CSP has no nonce mechanism for.
// 'unsafe-eval' is added to script-src only in development: Turbopack's
// dev-mode HMR/runtime calls eval() to reconstruct callstacks across
// module boundaries, and with no dev/prod split here that broke every
// page in `npm run dev` (React logs "eval() is not supported" and
// bails out of rendering). Production never gets 'unsafe-eval' — Next
// itself confirms it's not needed there ("React will never use eval()
// in production mode").
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // microphone=() is safe today — voice sessions aren't built yet (text only,
  // see NEXT_STEPS.md). Loosen this for the chat origin once voice ships.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
