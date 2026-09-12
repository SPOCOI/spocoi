export type Region = "MD" | "RO" | "UE";

export const REGION_HEADER = "x-spocoi-region";

export function resolveRegion(country?: string): Region {
  if (country === "RO") return "RO";
  if (country === "MD") return "MD";
  if (!country) return "MD"; // local dev / no geo signal from Vercel — fall back to home market
  return "UE"; // any other country buys at the "restul UE" price
}
