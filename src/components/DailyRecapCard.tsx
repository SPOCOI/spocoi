"use client";

import { useState } from "react";
import { dismissDailyRecap, type DailyRecap } from "@/app/actions/recap";
import type { RecapTopic } from "@/lib/ai/recap";

export function DailyRecapCard({
  recap,
  yesterdayLabel,
  dismissLabel,
  topicLabels,
}: {
  recap: DailyRecap;
  yesterdayLabel: string;
  dismissLabel: string;
  topicLabels: Record<RecapTopic, string>;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    dismissDailyRecap(recap.id);
  }

  return (
    <div
      className="rounded-2xl border border-line px-5 py-4"
      style={{ background: "var(--chat-surface)" }}
    >
      <span className="text-xs text-ink-faint">
        {topicLabels[recap.topic]} &middot; {yesterdayLabel}
      </span>
      <p className="mt-1.5 text-sm leading-relaxed text-ink">{recap.summary}</p>
      <button type="button" onClick={handleDismiss} className="mt-2.5 text-[11px] text-ink-faint underline">
        {dismissLabel}
      </button>
    </div>
  );
}
