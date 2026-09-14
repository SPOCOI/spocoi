"use client";

import { useState } from "react";
import { updateDisplayName } from "@/app/actions/account";

export function DisplayNameForm({
  initialName,
  label,
  placeholder,
  saveLabel,
  savedLabel,
}: {
  initialName: string;
  label: string;
  placeholder: string;
  saveLabel: string;
  savedLabel: string;
}) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    await updateDisplayName(name);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <label htmlFor="display-name" className="text-xs text-ink-soft">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="display-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="shrink-0 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-faint disabled:opacity-60"
        >
          {status === "saved" ? savedLabel : saveLabel}
        </button>
      </div>
    </form>
  );
}
