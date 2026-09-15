"use client";

import { useState } from "react";
import { sendMessage, type ChatMessage } from "@/app/actions/conversations";
import { summarizeCurrentConversation } from "@/app/actions/recap";
import type { Locale } from "@/i18n/config";

/** Below this, a conversation is too short for a summary to be worth
 * anything — the button stays hidden rather than sitting there useless. */
const MIN_MESSAGES_FOR_SUMMARY = 10;

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
  rateLimitedBurst,
  rateLimitedDaily,
  rateLimitedPlatform,
  summarizeLabel,
  summaryHeading,
  summaryClose,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
  locale: Locale;
  emptyState: string;
  inputPlaceholder: string;
  sendLabel: string;
  micLabel: string;
  rateLimitedBurst: string;
  rateLimitedDaily: string;
  rateLimitedPlatform: string;
  summarizeLabel: string;
  summaryHeading: string;
  summaryClose: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  async function handleSummarize() {
    if (summarizing) return;
    setSummarizing(true);
    const result = await summarizeCurrentConversation(conversationId, locale);
    setSummarizing(false);
    if (result) setSummary(result);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft("");
    setNotice(null);
    const result = await sendMessage(conversationId, text, locale);
    setSending(false);

    if (result.status === "ok") {
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
    } else if (result.status === "rate-limited") {
      const noticeByReason = {
        burst: rateLimitedBurst,
        daily: rateLimitedDaily,
        platform: rateLimitedPlatform,
      };
      setNotice(noticeByReason[result.reason]);
      setDraft(text);
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
              <p className="max-w-[85%] whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {m.content}
              </p>
              <span className="text-xs text-ink-faint">{formatTime(m.created_at, locale)}</span>
            </div>
          ),
        )}
        {sending && (
          <div className="flex gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
          </div>
        )}
      </main>

      <footer
        className="sticky bottom-0 border-t border-line/60 px-5 py-4"
        style={{ background: "color-mix(in srgb, var(--chat-bg) 92%, transparent)" }}
      >
        {notice && (
          <p className="mx-auto mb-3 max-w-2xl text-center text-xs text-ink-faint">{notice}</p>
        )}
        {summary && (
          <div
            className="mx-auto mb-3 flex max-w-2xl items-start justify-between gap-3 rounded-2xl border border-line px-4 py-3"
            style={{ background: "var(--chat-surface)" }}
          >
            <p className="text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{summaryHeading} </span>
              {summary}
            </p>
            <button
              type="button"
              onClick={() => setSummary(null)}
              aria-label={summaryClose}
              className="shrink-0 text-ink-faint hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-2.5">
          {messages.length >= MIN_MESSAGES_FOR_SUMMARY && (
            <button
              type="button"
              onClick={handleSummarize}
              disabled={summarizing}
              aria-label={summarizeLabel}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft hover:text-ink disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
                <path
                  d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
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
