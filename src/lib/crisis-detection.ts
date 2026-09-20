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

function stripDiacritics(s: string): string {
  return s.replace(/[ăâ]/g, "a").replace(/î/g, "i").replace(/ș/g, "s").replace(/ț/g, "t");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Typo budget scales with word length so short common words don't false-positive.
function maxTypoDistance(length: number): number {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

function fuzzyWordMatch(word: string, target: string): boolean {
  if (word === target) return true;
  const threshold = maxTypoDistance(target.length);
  if (Math.abs(word.length - target.length) > threshold) return false;
  return levenshtein(word, target) <= threshold;
}

// Stem keywords ("sinucid") are meant to match as the start of a longer
// word ("sinucidere") — compare against the word's prefix, not the whole
// word, so a typo doesn't have to land past the stem to still count.
function fuzzyStemMatch(word: string, stem: string): boolean {
  if (word.length < 3) return false;
  const threshold = maxTypoDistance(stem.length);
  for (const len of [stem.length - 1, stem.length, stem.length + 1]) {
    if (len <= 0 || len > word.length) continue;
    if (levenshtein(word.slice(0, len), stem) <= threshold) return true;
  }
  return false;
}

function fuzzyPhraseMatch(messageWords: string[], phraseWords: string[]): boolean {
  for (let start = 0; start <= messageWords.length - phraseWords.length; start++) {
    let matched = true;
    for (let i = 0; i < phraseWords.length; i++) {
      if (!fuzzyWordMatch(messageWords[start + i], phraseWords[i])) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

const NORMALIZED_KEYWORDS = CRISIS_KEYWORDS.map((keyword) => {
  const normalized = stripDiacritics(keyword.toLowerCase());
  return { normalized, words: normalized.split(/\s+/).filter(Boolean) };
});

export function containsCrisisSignal(text: string): boolean {
  const normalized = stripDiacritics(text.toLowerCase());

  // Fast path: exact (typo-free) match, same as before.
  if (NORMALIZED_KEYWORDS.some((k) => normalized.includes(k.normalized))) {
    return true;
  }

  // Fuzzy path: catches typos from someone typing in a hurry or in distress
  // — a stressed-out or panicked person is more likely to mistype, and a
  // missed crisis signal is a far worse outcome than an extra false positive.
  const messageWords = normalized.split(/[^a-z]+/).filter(Boolean);
  return NORMALIZED_KEYWORDS.some(({ words }) =>
    words.length === 1
      ? messageWords.some((w) => fuzzyStemMatch(w, words[0]))
      : fuzzyPhraseMatch(messageWords, words),
  );
}

export function buildCrisisReply(region: Region, locale: Locale): string {
  const resources = getCrisisResources(region, locale);
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
