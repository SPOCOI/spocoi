import type { Region } from "@/lib/region";

export const priceTable: Record<string, Record<Region, number>> = {
  free: { MD: 0, RO: 0, UE: 0 },
  simplu: { MD: 2.99, RO: 4.99, UE: 6.99 },
  plus: { MD: 6.99, RO: 9.99, UE: 14.99 },
  avansat: { MD: 14.99, RO: 19.99, UE: 29.99 },
};
