import "server-only";
import { getCrisisResources } from "@/lib/crisis";
import type { Region } from "@/lib/region";
import type { Locale } from "@/i18n/config";

/**
 * Deliberately basic — plain keyword matching, not sentiment analysis.
 * A false positive (routes to crisis resources unnecessarily) is a much
 * smaller harm than a false negative here, so this stays sensitive rather
 * than clever. Does not replace the legal disclaimer that the AI cannot
 * reliably detect a crisis — this only closes the gap between that
 * disclaimer and the crisis-detection capability described in the
 * Minister pitch deck.
 */
const CRISIS_KEYWORDS = [
  // Romanian
  "sinucid",
  "sinucig",
  "mă omor",
  "sa ma omor",
  "nu mai vreau să trăiesc",
  "nu mai vreau sa traiesc",
  "vreau să mor",
  "vreau sa mor",
  "să-mi iau viața",
  "sa-mi iau viata",
  "automutilare",
  "să mă tai",
  "sa ma tai",
  "să mă rănesc",
  "sa ma ranesc",
  "nu mai am rost",
  "mai bine mor",
  // English
  "suicide",
  "kill myself",
  "want to die",
  "end my life",
  "self-harm",
  "self harm",
  "hurt myself",
  "no reason to live",
  "better off dead",
];

export function containsCrisisSignal(text: string): boolean {
  const normalized = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function buildCrisisReply(region: Region, locale: Locale): string {
  const resources = getCrisisResources(region);
  const lines = resources.lines.map((l) => `${l.label}: ${l.number}`).join("\n");

  if (locale === "en") {
    return [
      "I'm really sorry you're going through this — but I'm not able to help in a real emergency.",
      `Please reach out right now: ${resources.emergency}${lines ? `\n${lines}` : ""}`,
      resources.note ?? "",
      "You don't have to go through this alone — please talk to someone who can actually help, right now.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    "Îmi pare rău că treci prin asta — dar nu pot să te ajut într-o urgență reală.",
    `Te rog să ceri ajutor chiar acum: ${resources.emergency}${lines ? `\n${lines}` : ""}`,
    resources.note ?? "",
    "Nu trebuie să treci prin asta singur/ă — te rog vorbește cu cineva care te poate ajuta cu adevărat, chiar acum.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
