"use client";

import { MoonPhase } from "@/components/MoonPhase";
import { useMood } from "@/components/MoodProvider";

export function MoodIndicator({
  statusListening,
  trendBetter,
  trendWorse,
}: {
  statusListening: string;
  trendBetter: string;
  trendWorse: string;
}) {
  const { state } = useMood();

  const trendLabel =
    state.trend === "better" ? trendBetter : state.trend === "worse" ? trendWorse : null;

  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-pulse rounded-full bg-brand/25" />
      <MoonPhase phase={state.phase} size={20} />
      <span className="sr-only">
        {statusListening}
        {trendLabel ? ` · ${trendLabel}` : ""}
      </span>
    </span>
  );
}

export function MoodStatusLabel({
  statusListening,
  trendBetter,
  trendWorse,
}: {
  statusListening: string;
  trendBetter: string;
  trendWorse: string;
}) {
  const { state } = useMood();
  const trendLabel =
    state.trend === "better" ? trendBetter : state.trend === "worse" ? trendWorse : null;

  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {statusListening}
      {trendLabel ? ` · ${trendLabel}` : ""}
    </span>
  );
}
