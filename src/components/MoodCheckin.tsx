"use client";

import { useState } from "react";
import { submitMoodCheckin, type MoodValue } from "@/app/actions/mood";
import { useMood } from "@/components/MoodProvider";

export function MoodCheckin({
  question,
  worseLabel,
  sameLabel,
  betterLabel,
  skipHint,
}: {
  question: string;
  worseLabel: string;
  sameLabel: string;
  betterLabel: string;
  skipHint: string;
}) {
  const { setState } = useMood();
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [dismissed, setDismissed] = useState(false);

  async function handlePick(value: MoodValue) {
    if (status !== "idle") return;
    setStatus("submitting");
    const next = await submitMoodCheckin(value);
    setState(next);
    setStatus("done");
  }

  if (dismissed || status === "done") return null;

  return (
    <div
      className="rounded-2xl border border-line px-5 py-4 text-center"
      style={{ background: "var(--chat-surface)" }}
    >
      <p className="text-sm font-medium text-ink">{question}</p>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={() => handlePick("worse")}
          className="flex-1 rounded-full border border-line px-3 py-2 text-xs text-ink-soft hover:border-ink-faint disabled:opacity-60"
        >
          {worseLabel}
        </button>
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={() => handlePick("same")}
          className="flex-1 rounded-full border border-line px-3 py-2 text-xs text-ink-soft hover:border-ink-faint disabled:opacity-60"
        >
          {sameLabel}
        </button>
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={() => handlePick("better")}
          className="flex-1 rounded-full bg-brand px-3 py-2 text-xs font-medium text-ink disabled:opacity-60"
        >
          {betterLabel}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-3 text-[11px] text-ink-faint underline"
      >
        {skipHint}
      </button>
    </div>
  );
}
