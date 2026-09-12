import type { Region } from "./region";

export type CrisisLine = { label: string; number: string };

export type CrisisResources = {
  /** Confident and universal — same emergency number in every region we serve. */
  emergency: string;
  /** Region-specific support lines. Empty when we don't have a verified number yet. */
  lines: CrisisLine[];
  /** Shown only when `lines` is empty, or as extra context — never invents a number. */
  note?: string;
};

/**
 * IMPORTANT: only include a phone number here if it's independently verified.
 * A wrong crisis-line number is worse than no number — it sends someone in a
 * real emergency down a dead end. Romania's two lines below come from the
 * recovered legal-page material (not independently re-verified this session
 * either — confirm before launch). Moldova and the general EU note are
 * deliberately conservative until someone sources a real, current number.
 */
const RESOURCES: Record<Region, CrisisResources> = {
  RO: {
    emergency: "112",
    lines: [
      { label: "Linia de prevenire a suicidului", number: "0800 801 200" },
      { label: "Linia de suport pentru sănătate mintală", number: "021 9629" },
    ],
  },
  MD: {
    emergency: "112",
    lines: [],
    note:
      "Nu avem încă o linie de sprijin emoțional verificată pentru Moldova — sună la 112 sau mergi la cea mai apropiată unitate medicală. (De completat cu o linie locală reală înainte de lansare.)",
  },
  UE: {
    emergency: "112",
    lines: [
      {
        label: "Linia armonizată UE de sprijin emoțional (disponibilă în majoritatea statelor membre)",
        number: "116 123",
      },
    ],
  },
};

export function getCrisisResources(region: Region): CrisisResources {
  return RESOURCES[region];
}
