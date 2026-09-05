import { describe, expect, it } from "vitest";
import { flavorGlow } from "./products";

describe("flavor glow colour", () => {
  it("returns an rgb triple every time", () => {
    for (const n of ["Grape Ice", "Tobacco", "Lady Killer", "Clear", "Zzz"]) {
      expect(flavorGlow(n)).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
    }
  });

  it("leads with the first-named ingredient on a pairing", () => {
    // "Strawberry Watermelon" is both; the name leads with strawberry and so
    // should the light.
    expect(flavorGlow("Strawberry Watermelon")).toBe(flavorGlow("Strawberry Cream"));
    expect(flavorGlow("Watermelon Ice")).not.toBe(flavorGlow("Strawberry Cream"));
  });

  it("puts blue razz ahead of the generic berry rule", () => {
    // Without the ordering, "Blue Razz Ice" would match /razz/ and glow purple
    // instead of the blue the packaging leads with.
    expect(flavorGlow("Blue Razz Ice")).toBe(flavorGlow("Blue Sour"));
    expect(flavorGlow("Blue Razz Ice")).not.toBe(flavorGlow("Triple Berry"));
  });

  it("falls back to a neutral rather than throwing on an unknown name", () => {
    expect(flavorGlow("Something Entirely New")).toBe("160 160 170");
  });

  it("is case-insensitive", () => {
    expect(flavorGlow("GRAPE ICE")).toBe(flavorGlow("grape ice"));
  });
});
