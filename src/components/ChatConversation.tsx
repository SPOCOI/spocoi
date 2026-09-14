"use client";

import { useState } from "react";
import { sendMessage, type ChatMessage } from "@/app/actions/conversations";
import type { Locale } from "@/i18n/config";

function formatTime(iso: string, locale: Locale) {
  return new Date(iso).toLocaleTimeString(locale === "ro" ? "ro-RO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatConversation({
  conversationId,
  initialMessages,
  locale,
  emptyState,
  inputPlaceholder,
  sendLabel,
  micLabel,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
  locale: Locale;
  emptyState: string;
  inputPlaceholder: string;
  sendLabel: string;
  micLabel: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft("");
    const result = await sendMessage(conversationId, text);
    setSending(false);

    if (result.status === "ok") {
      setMessages((prev) => [...prev, result.message]);
    } else {
      setDraft(text);
    }
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-6">
        {messages.length === 0 && (
          <p className="text-center text-sm text-ink-faint">{emptyState}</p>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              <div
                className="max-w-[80%] rounded-2xl rounded-br-sm border border-line px-4 py-2.5 text-[15px] leading-relaxed text-ink"
                style={{ background: "var(--chat-surface)" }}
              >
                {m.content}
              </div>
              <span className="pr-1 text-xs text-ink-faint">
                {formatTime(m.created_at, locale)}
              </span>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col gap-1.5">
              <p className="max-w-[85%] text-[15px] leading-relaxed text-ink-soft">
                {m.content}
              </p>
              <span className="text-xs text-ink-faint">{formatTime(m.created_at, locale)}</span>
            </div>
          ),
        )}
      </main>

      <footer
        className="sticky bottom-0 border-t border-line/60 px-5 py-4"
        style={{ background: "color-mix(in srgb, var(--chat-bg) 92%, transparent)" }}
      >
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-2.5">
          <div
            className="flex flex-1 items-center rounded-full border border-line px-4 py-3"
            style={{ background: "var(--chat-surface)" }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={inputPlaceholder}
              disabled={sending}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            aria-label={draft.trim() ? sendLabel : micLabel}
            disabled={sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {draft.trim() ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M4 12h15M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </form>
      </footer>
    </>
  );
}
