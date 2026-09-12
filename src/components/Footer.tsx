import Link from "next/link";
import { Logo } from "./Logo";

const legal = [
  { href: "/legal/privacy", label: "Politica de confidențialitate" },
  { href: "/legal/terms", label: "Termeni și condiții" },
  { href: "/legal/ai-disclaimer", label: "Despre AI" },
];

const socials = [
  { href: "https://instagram.com/spocoi", label: "Instagram" },
  { href: "https://www.tiktok.com/@spocoi", label: "TikTok" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Fără costuri mari, fără liste de așteptare, fără instalări — doar
            o conversație cu un AI empatic, oricând ai nevoie.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              Social
            </div>
            <ul className="flex flex-col gap-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ink-soft hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              Legal
            </div>
            <ul className="flex flex-col gap-2">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Delgra SRL — SPOCOI. Operat din Moldova, găzduit în UE.
      </div>
    </footer>
  );
}
