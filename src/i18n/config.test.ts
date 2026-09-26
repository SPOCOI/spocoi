import { describe, it, expect } from "vitest";
import { isLocale, stripLocalePrefix, localizedHref } from "./config";

describe("isLocale", () => {
  it("accepts ro and en", () => {
    expect(isLocale("ro")).toBe(true);
    expect(isLocale("en")).toBe(true);
  });

  it("rejects Russian and any other locale — excluded explicitly (12 Sep 2026)", () => {
    expect(isLocale("ru")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("stripLocalePrefix", () => {
  it("strips /en", () => {
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/en/pricing")).toBe("/pricing");
  });

  it("leaves unprefixed (default locale) paths untouched", () => {
    expect(stripLocalePrefix("/pricing")).toBe("/pricing");
    expect(stripLocalePrefix("/")).toBe("/");
  });
});

describe("localizedHref", () => {
  it("leaves the default locale (ro) unprefixed", () => {
    expect(localizedHref("/pricing", "ro")).toBe("/pricing");
    expect(localizedHref("/", "ro")).toBe("/");
  });

  it("prefixes non-default locales", () => {
    expect(localizedHref("/pricing", "en")).toBe("/en/pricing");
    expect(localizedHref("/", "en")).toBe("/en");
  });
});
