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
    greeting: "Salut! Sunt aici să răspund la întrebări despre spocoi — preț, waitlist, ce facem. Alege o categorie sau scrie direct întrebarea ta.",
    error: "A apărut o eroare. Încearcă din nou sau scrie-ne la hello@spocoi.com.",
    capExceeded: "Chat-ul e temporar indisponibil — scrie-ne direct la hello@spocoi.com.",
    back: "înapoi",
    menu: "meniu",
    contactHuman: "Vorbește cu un om",
    contactIntro: "Scrie-ne mesajul aici — răspundem direct pe email, la adresa ta.",
    contactEmailPlaceholder: "Emailul tău",
    contactMessagePlaceholder: "Mesajul tău...",
    contactSend: "Trimite mesajul",
    contactSending: "Se trimite...",
    contactSent: "Trimis! Îți răspundem cât de curând, pe email.",
    contactError: "Nu am putut trimite mesajul. Încearcă din nou sau scrie-ne la hello@spocoi.com.",
    contactRateLimited: "Ai trimis deja câteva mesaje — încearcă din nou peste puțin timp.",
    contactInvalid: "Verifică adresa de email și scrie un mesaj înainte de a trimite.",
  },
  en: {
    bubbleLabel: "Open support chat",
    title: "spocoi support",
    subtitle: "Ask about pricing, waitlist or the product",
    placeholder: "Type a message...",
    send: "Send",
    greeting: "Hi! I'm here to answer questions about spocoi — pricing, waitlist, what we're building. Pick a category or just type your question.",
    error: "Something went wrong. Try again or email hello@spocoi.com.",
    capExceeded: "Chat is temporarily unavailable — email us directly at hello@spocoi.com.",
    back: "back",
    menu: "menu",
    contactHuman: "Talk to a human",
    contactIntro: "Write your message here — we'll reply directly to your email.",
    contactEmailPlaceholder: "Your email",
    contactMessagePlaceholder: "Your message...",
    contactSend: "Send message",
    contactSending: "Sending...",
    contactSent: "Sent! We'll get back to you by email shortly.",
    contactError: "Couldn't send your message. Try again or email hello@spocoi.com.",
    contactRateLimited: "You've sent a few messages already — try again in a bit.",
    contactInvalid: "Check your email address and write a message before sending.",
  },
} as const;

// Answered instantly, client-side, with no API call — zero cost and zero
// latency for the questions visitors ask most often. Keep these in sync with
// the facts in support-chat.ts's system prompt; a free-text question still
// goes to the model. Grouped into categories (product, pricing, security,
// company, practical) rather than one flat list — 20 questions as separate
// chips would overflow the small widget panel.
const QUICK_REPLY_CATEGORIES = {
  ro: [
    {
      category: "Produs",
      items: [
        {
          question: "Ce este spocoi?",
          answer:
            "spocoi e o platformă AI de suport emoțional (voce/text) pentru Moldova, România și diaspora UE — o alternativă accesibilă, disponibilă 24/7, la terapia tradițională. Nu e încă lansată; momentan poți doar să te înscrii pe waitlist.",
        },
        {
          question: "spocoi înlocuiește un psiholog licențiat?",
          answer:
            "Nu. spocoi e un instrument de suport, nu un terapeut licențiat — nu diagnostichează și nu prescrie tratament. E gândit ca o resursă complementară, accesibilă oricând, nu ca înlocuitor total.",
        },
        {
          question: "De ce spocoi și nu terapie tradițională?",
          answer:
            "Terapia tradițională poate fi scumpă și greu accesibilă (liste de așteptare, program fix). spocoi e disponibil 24/7, la un preț mult mai mic, ca prim pas sau completare.",
        },
        {
          question: "Cum funcționează o sesiune voce?",
          answer:
            "E o conversație vocală live cu AI-ul, de 5 minute, disponibilă pe tier-urile plătite (SIMPLU/PLUS/AVANSAT).",
        },
        {
          question: "Este disponibil acum?",
          answer:
            "Nu încă — momentan poți doar să te înscrii pe waitlist. Vei fi anunțat când produsul e gata.",
        },
      ],
    },
    {
      category: "Preț & waitlist",
      items: [
        {
          question: "Cât costă?",
          answer:
            "Prețul e adaptat geografic (MD/RO/UE): FREE $0; SIMPLU 2.99$/4.99$/6.99$ (1 sesiune voce de 5min); PLUS 6.99$/9.99$/14.99$ (5×5min); AVANSAT 17.99$/24.99$/34.99$ (20×5min).",
        },
        {
          question: "Câte sesiuni voce am la fiecare tier?",
          answer:
            "SIMPLU: 1 sesiune de 5min. PLUS: 5 sesiuni de 5min. AVANSAT: 20 sesiuni de 5min. FREE nu include sesiuni voce.",
        },
        {
          question: "Cum funcționează waitlist-ul?",
          answer:
            "Are 3 niveluri: Fondator (primii 100 înscriși), Pioneer (101–500), Early Adopter (501–1000). După poziția 1000, înscrierile rămân deschise, doar fără etichetă de tier.",
        },
        {
          question: "Când se lansează spocoi?",
          answer:
            "Nu avem încă o dată fixă de lansare — cel mai sigur mod să afli primul e să te înscrii pe waitlist.",
        },
      ],
    },
    {
      category: "Securitate & confidențialitate",
      items: [
        {
          question: "Datele mele sunt în siguranță?",
          answer:
            "Da — conversațiile sunt criptate, iar toată infrastructura (bază de date, găzduire) e în UE, conform GDPR.",
        },
        {
          question: "Unde sunt găzduite datele mele?",
          answer:
            "Integral în UE — baza de date rulează pe Supabase în Frankfurt, Germania, iar aplicația pe Vercel.",
        },
        {
          question: "Cine poate vedea conversațiile mele?",
          answer:
            "Conversațiile tale sunt private — nu sunt partajate cu terți. Doar tu ai acces la ele, prin contul tău.",
        },
        {
          question: "Pot cere ștergerea datelor mele?",
          answer:
            "Da, oricând — scrie-ne la hello@spocoi.com și îți ștergem datele, conform drepturilor GDPR.",
        },
      ],
    },
    {
      category: "Companie & legal",
      items: [
        {
          question: "Cine este în spatele spocoi?",
          answer:
            "Operatorul curent e Delgra SRL (Moldova); în paralel înregistrăm SPOCOI OÜ (Estonia) ca holding.",
        },
        {
          question: "Este spocoi o companie înregistrată legal?",
          answer:
            "Da, prin Delgra SRL în Moldova. Structura completă (inclusiv holding-ul din Estonia) e încă în curs de finalizare.",
        },
        {
          question: "Ce vârstă minimă am nevoie?",
          answer:
            "Vârsta minimă e încă în clarificare legală — paginile noastre de Termeni și Confidențialitate sunt marcate explicit ca draft, în așteptarea unei revizuiri juridice complete.",
        },
      ],
    },
    {
      category: "Practic & siguranță",
      items: [
        {
          question: "În ce limbi e disponibil?",
          answer: "Momentan spocoi funcționează live în română și engleză.",
        },
        {
          question: "Cum mă dezabonez de la email?",
          answer:
            "Fiecare email are un link de dezabonare în footer — un click și nu mai primești nimic. Sau scrie-ne oricând la hello@spocoi.com.",
        },
        {
          question: "Ce fac dacă am o urgență emoțională?",
          answer:
            "spocoi nu e potrivit pentru urgențe. Dacă ești în pericol sau ai gânduri de auto-vătămare, sună la 112 sau contactează o linie de încredere pentru sănătate mintală imediat.",
        },
        {
          question: "Cum vă pot contacta?",
          answer: "Scrie-ne oricând la hello@spocoi.com — răspundem cât de repede putem.",
        },
      ],
    },
  ],
  en: [
    {
      category: "Product",
      items: [
        {
          question: "What is spocoi?",
          answer:
            "spocoi is an AI emotional-support platform (voice/text) for Moldova, Romania and the EU diaspora — an accessible, 24/7 alternative to traditional therapy. Not yet launched; currently waitlist only.",
        },
        {
          question: "Does spocoi replace a licensed psychologist?",
          answer:
            "No. spocoi is a support tool, not a licensed therapist — it doesn't diagnose or prescribe treatment. Think of it as an accessible, complementary resource, not a full replacement.",
        },
        {
          question: "Why spocoi instead of traditional therapy?",
          answer:
            "Traditional therapy can be expensive and hard to access (waitlists, fixed schedules). spocoi is available 24/7 at a much lower price, as a first step or complement.",
        },
        {
          question: "How does a voice session work?",
          answer:
            "It's a live 5-minute voice conversation with the AI, available on paid tiers (SIMPLU/PLUS/AVANSAT).",
        },
        {
          question: "Is it available now?",
          answer:
            "Not yet — currently you can only join the waitlist. You'll be notified when it's ready.",
        },
      ],
    },
    {
      category: "Pricing & waitlist",
      items: [
        {
          question: "How much does it cost?",
          answer:
            "Pricing is geo-adaptive (MD/RO/EU): FREE $0; SIMPLU $2.99/$4.99/$6.99 (1×5min voice session); PLUS $6.99/$9.99/$14.99 (5×5min); AVANSAT $17.99/$24.99/$34.99 (20×5min).",
        },
        {
          question: "How many voice sessions do I get per tier?",
          answer:
            "SIMPLU: 1×5min session. PLUS: 5×5min. AVANSAT: 20×5min. FREE doesn't include voice sessions.",
        },
        {
          question: "How does the waitlist work?",
          answer:
            "3 tiers: Founder (first 100 signups), Pioneer (101–500), Early Adopter (501–1000). After position 1000, signups stay open with no tier label.",
        },
        {
          question: "When does spocoi launch?",
          answer:
            "We don't have a fixed launch date yet — join the waitlist to be the first to know.",
        },
      ],
    },
    {
      category: "Security & privacy",
      items: [
        {
          question: "Is my data safe?",
          answer:
            "Yes — conversations are encrypted, and all infrastructure (database, hosting) is EU-based, in line with GDPR.",
        },
        {
          question: "Where is my data hosted?",
          answer:
            "Entirely in the EU — the database runs on Supabase in Frankfurt, Germany, and the app on Vercel.",
        },
        {
          question: "Who can see my conversations?",
          answer:
            "Your conversations are private — never shared with third parties. Only you have access, through your account.",
        },
        {
          question: "Can I request my data be deleted?",
          answer:
            "Yes, anytime — email hello@spocoi.com and we'll delete your data, per your GDPR rights.",
        },
      ],
    },
    {
      category: "Company & legal",
      items: [
        {
          question: "Who's behind spocoi?",
          answer:
            "The current operator is Delgra SRL (Moldova); we're also registering SPOCOI OÜ (Estonia) as a holding company.",
        },
        {
          question: "Is spocoi a legally registered company?",
          answer:
            "Yes, through Delgra SRL in Moldova. The full structure (including the Estonian holding) is still being finalized.",
        },
        {
          question: "What's the minimum age to use spocoi?",
          answer:
            "The minimum age is still under legal review — our Terms and Privacy pages are explicitly marked as drafts pending a full legal review.",
        },
      ],
    },
    {
      category: "Practical & safety",
      items: [
        {
          question: "What languages are supported?",
          answer: "spocoi currently runs live in Romanian and English.",
        },
        {
          question: "How do I unsubscribe from emails?",
          answer:
            "Every email has an unsubscribe link in the footer — one click and you're out. Or email us anytime at hello@spocoi.com.",
        },
        {
          question: "What if I'm having an emotional emergency?",
          answer:
            "spocoi isn't built for emergencies. If you're in danger or having thoughts of self-harm, call emergency services or a mental-health crisis line immediately.",
        },
        {
          question: "How can I contact you?",
          answer: "Email us anytime at hello@spocoi.com — we'll get back to you as soon as we can.",
        },
      ],
    },
  ],
} as const;

// Hidden on /chat (the actual product's AI conversation — a second chat
// bubble there is redundant and confusing) and /admin (internal tool, not
// visitor-facing).
const HIDDEN_PATH_SEGMENTS = ["/chat", "/admin"];

export function SupportChatWidget({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = COPY[locale] ?? COPY.ro;
  const categories = QUICK_REPLY_CATEGORIES[locale] ?? QUICK_REPLY_CATEGORIES.ro;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "rate-limited" | "invalid"
  >("idle");
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

  function sendQuickReply(question: string, answer: string) {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ]);
    setActiveCategory(null);
  }

  // Once real messages exist, the category chips are gone for good with no
  // way back — this returns to the category list without losing the
  // conversation (closing/reopening the widget doesn't reset it either).
  function resetToMenu() {
    setMessages([]);
    setActiveCategory(null);
  }

  const selectedCategory = categories.find((c) => c.category === activeCategory) ?? null;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // A mailto: link silently does nothing on a system with no default mail
  // client configured (common — webmail-only setups), which reads as "the
  // button is broken". Collecting the message right here and emailing it
  // server-side (reply-to set to the visitor's address) means replying is
  // just hitting "Reply" in the team inbox — no dashboard, no new system.
  async function sendContactMessage() {
    if (!EMAIL_RE.test(contactEmail.trim()) || contactMessage.trim().length === 0) {
      setContactStatus("invalid");
      return;
    }
    setContactStatus("sending");
    try {
      const response = await fetch("/api/contact-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail.trim(), message: contactMessage.trim() }),
      });
      const data = (await response.json()) as { status: string };
      if (data.status === "ok") {
        setContactStatus("sent");
        setContactMessage("");
      } else if (data.status === "rate-limited") {
        setContactStatus("rate-limited");
      } else if (data.status === "invalid") {
        setContactStatus("invalid");
      } else {
        setContactStatus("error");
      }
    } catch {
      setContactStatus("error");
    }
  }

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line">
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
                <p className="truncate text-xs text-ink-faint">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="shrink-0 pl-3 text-ink-faint hover:text-ink"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 pb-2 pt-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={resetToMenu}
                  className="whitespace-nowrap text-xs text-ink-faint hover:text-ink"
                >
                  ↺ {t.menu}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setContactOpen(true);
                  setContactStatus("idle");
                }}
                className="whitespace-nowrap text-xs text-ink-faint hover:text-ink"
              >
                {t.contactHuman}
              </button>
            </div>
          </div>

          {contactOpen && (
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="mb-3 self-start text-xs text-ink-faint hover:text-ink"
              >
                ← {t.back}
              </button>

              {contactStatus === "sent" ? (
                <div className="rounded-xl bg-paper px-3 py-3 text-sm text-ink">
                  {t.contactSent}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <p className="text-sm text-ink-soft">{t.contactIntro}</p>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={t.contactEmailPlaceholder}
                    className="rounded-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                  />
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={t.contactMessagePlaceholder}
                    maxLength={4000}
                    rows={4}
                    className="resize-none rounded-2xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                  />
                  {contactStatus === "invalid" && (
                    <p className="text-xs text-red-600">{t.contactInvalid}</p>
                  )}
                  {contactStatus === "error" && (
                    <p className="text-xs text-red-600">{t.contactError}</p>
                  )}
                  {contactStatus === "rate-limited" && (
                    <p className="text-xs text-red-600">{t.contactRateLimited}</p>
                  )}
                  <button
                    type="button"
                    onClick={sendContactMessage}
                    disabled={contactStatus === "sending"}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
                  >
                    {contactStatus === "sending" ? t.contactSending : t.contactSend}
                  </button>
                </div>
              )}
            </div>
          )}

          {!contactOpen && (
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div className="max-w-[85%] rounded-xl bg-paper px-3 py-2 text-sm text-ink">
              {t.greeting}
            </div>
            {messages.length === 0 && !selectedCategory && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => setActiveCategory(c.category)}
                    className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-brand"
                  >
                    {c.category}
                  </button>
                ))}
              </div>
            )}
            {messages.length === 0 && selectedCategory && (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="text-xs text-ink-faint hover:text-ink"
                >
                  ← {t.back}
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory.items.map((qr) => (
                    <button
                      key={qr.question}
                      type="button"
                      onClick={() => sendQuickReply(qr.question, qr.answer)}
                      className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-ink-soft hover:border-brand hover:text-ink"
                    >
                      {qr.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          )}

          {!contactOpen && (
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
          )}
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
