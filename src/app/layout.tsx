import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={poppins.variable} suppressHydrationWarning>
      <head>
        {/* Blocking, runs before first paint — applies the stored theme
            before React hydrates, so there's no flash of the wrong theme
            on a fresh page load. Keep in sync with ThemeToggle.tsx. External
            file (not inline) so the CSP script-src doesn't need
            'unsafe-inline'. */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
