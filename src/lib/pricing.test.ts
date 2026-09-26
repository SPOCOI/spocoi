import { describe, it, expect } from "vitest";
import { priceTable } from "./pricing";

// Locks in CLAUDE.md's documented pricing table so a future edit that drifts
// from the published prices (marketing copy, campaign emails, admin MRR math
// all assume this table) fails loudly instead of silently.
describe("priceTable", () => {
  it("matches the documented FREE tier (always $0)", () => {
    expect(priceTable.free).toEqual({ MD: 0, RO: 0, UE: 0 });
  });

  it("matches the documented SIMPLU tier", () => {
    expect(priceTable.simplu).toEqual({ MD: 2.99, RO: 4.99, UE: 6.99 });
  });

  it("matches the documented PLUS tier", () => {
    expect(priceTable.plus).toEqual({ MD: 6.99, RO: 9.99, UE: 14.99 });
  });

  it("matches the documented AVANSAT tier (post Sep 22 2026 increase)", () => {
    expect(priceTable.avansat).toEqual({ MD: 17.99, RO: 24.99, UE: 34.99 });
  });

  it("prices increase MD < RO < UE for every paid tier", () => {
    for (const tier of ["simplu", "plus", "avansat"] as const) {
      const { MD, RO, UE } = priceTable[tier];
      expect(MD).toBeLessThan(RO);
      expect(RO).toBeLessThan(UE);
    }
  });
});
