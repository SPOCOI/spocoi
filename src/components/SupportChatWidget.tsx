"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

type Message = { role: "user" | "assistant"; content: string };

const COPY = {
  ro: {
    bubbleLabel: "Deschide chat suport",
    title: "Suport spocoi",
    subtitle: "Întreabă despre preț, waitlist sau produs",
    placeholder: "Scrie un mesaj...",
    send: "Trimite",
    greeting: "Salut! Sunt aici să răspund la întrebări despre spocoi — preț, waitlist, ce facem. Cu ce te pot ajuta?",
    error: "A apărut o eroare. Încearcă din nou sau scrie-ne la hello@spocoi.com.",
    capExceeded: "Chat-ul e temporar indisponibil — scrie-ne direct la hello@spocoi.com.",
  },
  en: {
    bubbleLabel: "Open support chat",
    title: "spocoi support",
    subtitle: "Ask about pricing, waitlist or the product",
    placeholder: "Type a message...",
    send: "Send",
    greeting: "Hi! I'm here to answer questions about spocoi — pricing, waitlist, what we're building. What can I help with?",
    error: "Something went wrong. Try again or email hello@spocoi.com.",
    capExceeded: "Chat is temporarily unavailable — email us directly at hello@spocoi.com.",
  },
} as const;

// Hidden on /chat (the actual product's AI conversation — a second chat
// bubble there is redundant and confusing) and /admin (internal tool, not
// visitor-facing).
const HIDDEN_PATH_SEGMENTS = ["/chat", "/admin"];

export function SupportChatWidget({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = COPY[locale] ?? COPY.ro;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const hidden = HIDDEN_PATH_SEGMENTS.some((segment) => pathname?.includes(segment));

  async function sendMessage() {
    const content = input.trim();
    if (!content || isSending) return;

    const nextHistory = [...messages, { role: "user" as const, content }];
    setMessages(nextHistory);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory.slice(-12), locale }),
      });

      if (response.status === 503) {
        setMessages([...nextHistory, { role: "assistant", content: t.capExceeded }]);
        return;
      }
      if (!response.ok) throw new Error("request-failed");

      const data = (await response.json()) as { reply: string };
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...nextHistory, { role: "assistant", content: t.error }]);
    } finally {
      setIsSending(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              <p className="text-xs text-ink-faint">{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="close"
              className="text-ink-faint hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div className="max-w-[85%] rounded-xl bg-paper px-3 py-2 text-sm text-ink">
              {t.greeting}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-brand text-ink"
                    : "bg-paper text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[85%] rounded-xl bg-paper px-3 py-2 text-sm text-ink-faint">
                ...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              maxLength={1000}
              className="min-w-0 flex-1 rounded-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
            >
              {t.send}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.bubbleLabel}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl shadow-lg transition-transform hover:scale-105"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
