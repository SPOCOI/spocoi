import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "spocoi — vorbește despre ce te apasă, oricând",
  description:
    "SPOCOI e un AI de suport emoțional în română, rusă și engleză — disponibil 24/7, fără costuri mari și fără liste de așteptare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={poppins.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
