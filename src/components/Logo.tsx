const MOON_PATH =
  "M27 6C19 8 14 15 14 22c0 8 6 14 14 14 2.6 0 5-.6 7.1-1.7C31.4 37.9 26 40 20 40 9 40 0 31 0 20S9 0 20 0c3.2 0 6.2.8 8.9 2.1C26.4 3 27 4.4 27 6z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d={MOON_PATH} fill="var(--color-brand)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-6 w-6 shrink-0" />
      <span className="text-xl font-bold tracking-tight text-ink">spocoi</span>
    </span>
  );
}
