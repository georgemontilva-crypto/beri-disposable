import { describe, expect, it } from "vitest";

/** Mirrors deriveProfile in lib/products.ts. */
function deriveProfile(name: string): string {
  const n = name.toLowerCase();
  if (/mint/.test(n)) return "Mint";
  if (/(ice|frost|polar|frozen|cool)/.test(n)) return "Ice";
  if (/(taffy|gami|pop|cream|caramel|cola|ropes|gelato|candy|drank|milk|saverz|slush|lemonade|punch|gush)/.test(n))
    return "Sweet";
  if (
    /(berry|berries|razz|apple|banana|grape|mango|melon|watermelon|peach|strawberry|cherry|citrus|lime|lemon|coconut|pineapple|juice|tropical|rancher|sour)/.test(n)
  )
    return "Fruit";
  return "Other";
}

describe("flavor profile rules", () => {
  it("puts mint ahead of ice, so Alaskan Mint is minty not icy", () => {
    expect(deriveProfile("Alaskan Mint")).toBe("Mint");
    expect(deriveProfile("Miami Mint")).toBe("Mint");
  });

  it("puts ice ahead of fruit: the chill is what you taste first", () => {
    expect(deriveProfile("Blue Razz Ice")).toBe("Ice");
    expect(deriveProfile("Grape Ice")).toBe("Ice");
  });

  it("reads confectionery names as sweet", () => {
    expect(deriveProfile("Banana Taffy")).toBe("Sweet");
    expect(deriveProfile("Cherry Cola Gami")).toBe("Sweet");
    expect(deriveProfile("Pistachio Gelato")).toBe("Sweet");
  });

  it("falls through to fruit for plain fruit names", () => {
    expect(deriveProfile("Green Apple")).toBe("Fruit");
    expect(deriveProfile("Mango Bomb")).toBe("Fruit");
  });

  it("matches mint inside a derived word", () => {
    // A strict \bmint\b boundary dropped "Minty O's" through every other rule
    // and into "Other", which is plainly wrong for a mint flavour.
    expect(deriveProfile("Minty O's")).toBe("Mint");
  });

  it("has a bucket for anything unmatched rather than dropping it", () => {
    expect(deriveProfile("Tobacco")).toBe("Other");
    expect(deriveProfile("Clear")).toBe("Other");
  });
});
