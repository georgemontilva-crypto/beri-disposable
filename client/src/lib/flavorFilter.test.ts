import { describe, expect, it } from "vitest";

type F = { slug: string; slot: string; edition?: string };

/** Mirrors the `mounted` guard in FlavorShowcase. */
function mounted(flavors: F[], uploaded: Set<string>): F[] {
  const withImages = flavors.filter((f) => uploaded.has(f.slot));
  return withImages.length ? withImages : flavors;
}

/** Mirrors the chip list: Regular first, then editions that exist. */
function chips(list: F[]): string[] {
  const editions: string[] = [];
  for (const f of list) {
    if (f.edition && !editions.includes(f.edition)) editions.push(f.edition);
  }
  return [...(list.some((f) => !f.edition) ? ["Regular"] : []), ...editions];
}

const flavors: F[] = [
  { slug: "a", slot: "s_a" },
  { slug: "b", slot: "s_b" },
  { slug: "c", slot: "s_c", edition: "Summer Edition" },
  { slug: "d", slot: "s_d", edition: "Winter Edition" },
];

describe("only mounted flavors", () => {
  it("lists just the ones with an uploaded image", () => {
    const out = mounted(flavors, new Set(["s_a", "s_c"]));
    expect(out.map((f) => f.slug)).toEqual(["a", "c"]);
  });

  it("falls back to the full list when nothing is uploaded", () => {
    // Otherwise the section would disappear entirely and there'd be no sign of
    // what still needs shooting.
    expect(mounted(flavors, new Set()).length).toBe(4);
  });
});

describe("edition chips", () => {
  it("puts Regular first, then the editions in order", () => {
    expect(chips(flavors)).toEqual(["Regular", "Summer Edition", "Winter Edition"]);
  });

  it("hides an edition with nothing uploaded", () => {
    const out = mounted(flavors, new Set(["s_a", "s_d"]));
    expect(chips(out)).toEqual(["Regular", "Winter Edition"]);
  });

  it("drops Regular when only edition flavors are mounted", () => {
    const out = mounted(flavors, new Set(["s_c"]));
    expect(chips(out)).toEqual(["Summer Edition"]);
  });
});

describe("ranges that reuse names", () => {
  const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const slot = (key: string, name: string, prefix = "") =>
    `${key}_flavor_${prefix}${toSlug(name)}`;

  it("keeps a battery apart from the pod of the same name", () => {
    // Four Cliq batteries share a name with a pod. Without the prefix both
    // resolve to one media slot and the tabs would show the same photo.
    expect(slot("cliq", "Grape Ice")).not.toBe(
      slot("cliq", "Grape Ice", "battery-")
    );
  });

  it("gives every battery its own slot", () => {
    const batteries = [
      "Original",
      "Blue Razz",
      "Grape Ice",
      "White Strawberry",
      "Watermelon Ice",
      "Green Apple",
    ];
    const slots = batteries.map((b) => slot("cliq", b, "battery-"));
    expect(new Set(slots).size).toBe(batteries.length);
  });
});

describe("range-scoped promo", () => {
  /** Mirrors the guard in FlavorShowcase. */
  const shows = (promoRange: string, activeTab: string) => promoRange === activeTab;

  it("shows the offer on the range it belongs to", () => {
    expect(shows("Pods", "Pods")).toBe(true);
  });

  it("hides it on every other tab", () => {
    // An offer on pods must not follow the visitor into the batteries tab,
    // where it would advertise something that isn't on screen.
    expect(shows("Pods", "Batteries")).toBe(false);
    expect(shows("Pods", "Kits")).toBe(false);
  });
});
