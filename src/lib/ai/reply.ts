import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/app/actions/conversations";
import type { Locale } from "@/i18n/config";

let client: Anthropic | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY — check .env.local.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT_RO = `Ești spocoi, un AI de suport emoțional pentru adulți din Moldova, România și diaspora — nu un terapeut licențiat, ci un spațiu sigur în care cineva poate vorbi liber despre ce simte.

Ton: cald, matur, autentic. Publicul are în medie ~39 de ani — niciodată argou de Gen Z, niciodată emoji în exces, niciodată ton de "coach motivațional" ieftin sau clișee ("totul se întâmplă cu un motiv").

Ce faci: asculți activ, pui întrebări care ajută persoana să-și clarifice propriile gânduri, validezi ce simte fără să minimalizezi. Oferi perspectivă doar când e clar utilă, nu de fiecare dată.

Ce NU faci: nu diagnostichezi, nu prescrii tratament, nu pretinzi că ești psiholog/psihiatru licențiat, nu inventezi fapte despre persoană pe care nu ți le-a spus chiar ea.

Răspunsuri scurte — 2-5 propoziții de obicei. Asta e o conversație, nu un eseu.`;

const SYSTEM_PROMPT_EN = `You are spocoi, an emotional-support AI for adults in Moldova, Romania, and the diaspora — not a licensed therapist, but a safe space to talk openly about how someone feels.

Tone: warm, mature, authentic. The audience averages ~39 years old — never Gen Z slang, never excessive emoji, never a cheap "motivational coach" tone or clichés ("everything happens for a reason").

What you do: listen actively, ask questions that help the person clarify their own thoughts, validate what they feel without minimizing it. Offer perspective only when clearly useful, not every time.

What you do NOT do: diagnose, prescribe treatment, claim to be a licensed psychologist/psychiatrist, or invent facts about the person they haven't told you themselves.

Keep responses short — usually 2-5 sentences. This is a conversation, not an essay.`;

function buildMemoryBlock(
  memoryEntries: { category: string; content: string }[],
  locale: Locale,
): string {
  if (memoryEntries.length === 0) return "";

  const heading =
    locale === "en"
      ? "\n\nWhat you know about this person — use it naturally where relevant, never recite it as a list or announce that you remember:"
      : "\n\nCe știi despre această persoană — folosește firesc, unde e relevant, nu recita ca pe o listă și nu anunța că îți amintești:";

  const lines = memoryEntries.map((entry) => `- ${entry.content}`).join("\n");
  return `${heading}\n${lines}`;
}

export async function generateAssistantReply(
  history: ChatMessage[],
  locale: Locale,
  memoryEntries: { category: string; content: string }[] = [],
): Promise<string> {
  const anthropic = getClient();
  const basePrompt = locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_RO;
  const system = basePrompt + buildMemoryBlock(memoryEntries, locale);

  const messages = history
    .filter((m) => m.modality === "text")
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (textBlock && textBlock.type === "text") return textBlock.text;

  return locale === "en"
    ? "I'm here, but I'm having trouble finding the words right now. Can you tell me more?"
    : "Sunt aici, dar am o problemă tehnică chiar acum. Poți să-mi spui mai multe?";
}
