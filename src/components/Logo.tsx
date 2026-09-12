const MOON_PATH = "M17.58,2.52 A11,11 0 1,0 17.58,21.48 A9.5,9.5 0 0,1 17.58,2.52 Z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
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
