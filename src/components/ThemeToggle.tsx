"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("spocoi-theme");
  return stored === "light" || stored === "dark" ? stored : null;
}

function applyTheme(theme: Theme | null) {
  const root = document.documentElement;
  if (theme) {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = theme ?? (systemPrefersDark ? "dark" : "light");
    const next: Theme = current === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem("spocoi-theme", next);
  }

  const showDarkIcon = mounted
    ? (theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "light"
    : false;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={showDarkIcon ? "Comută la tema întunecată" : "Comută la tema luminoasă"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:text-ink ${className}`}
    >
      {showDarkIcon ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M20 15.5a8.5 8.5 0 1 1-9.5-9.5 7 7 0 0 0 9.5 9.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
