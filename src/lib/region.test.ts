import { describe, it, expect } from "vitest";
import { resolveRegion } from "./region";

describe("resolveRegion", () => {
  it("maps RO to RO", () => {
    expect(resolveRegion("RO")).toBe("RO");
  });

  it("maps MD to MD", () => {
    expect(resolveRegion("MD")).toBe("MD");
  });

  it("falls back to MD when no country signal is present (local dev)", () => {
    expect(resolveRegion(undefined)).toBe("MD");
  });

  it("buys at the rest-of-EU price for any other country", () => {
    expect(resolveRegion("DE")).toBe("UE");
    expect(resolveRegion("US")).toBe("UE");
    expect(resolveRegion("FR")).toBe("UE");
  });
});
