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

describe("explicit tab order", () => {
  /** Mirrors the ordering in FlavorShowcase. */
  function order(present: string[], rangeOrder?: string[]): string[] {
    if (!rangeOrder) return present;
    const ranked = rangeOrder.filter((r) => present.includes(r));
    return [...ranked, ...present.filter((r) => !ranked.includes(r))];
  }

  it("puts Kits before Pods when the product asks for it", () => {
    expect(order(["Pods", "Kits", "Batteries"], ["Kits", "Pods", "Batteries"])).toEqual([
      "Kits",
      "Pods",
      "Batteries",
    ]);
  });

  it("skips a range in the order that has nothing uploaded", () => {
    // Otherwise a product would show an empty tab just because the order
    // mentions it.
    expect(order(["Pods"], ["Kits", "Pods", "Batteries"])).toEqual(["Pods"]);
  });

  it("keeps a range that the order forgot to mention", () => {
    expect(order(["Pods", "Mystery"], ["Pods"])).toEqual(["Pods", "Mystery"]);
  });

  it("leaves order alone when the product doesn't specify one", () => {
    expect(order(["Core Collection", "Summer Edition"])).toEqual([
      "Core Collection",
      "Summer Edition",
    ]);
  });
});

describe("per-range banner slot", () => {
  const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const rangeBannerSlot = (key: string, range: string) =>
    `${key}_banner_${toSlug(range)}`;

  it("gives every range its own slot", () => {
    const ranges = [
      "Core Collection",
      "Summer Edition",
      "Winter Edition",
      "Graffiti Edition",
      "0% Nicotine",
    ];
    const slots = ranges.map((r) => rangeBannerSlot("crush", r));
    expect(new Set(slots).size).toBe(ranges.length);
  });

  it("never collides with the product's default banner", () => {
    // The default is `crush_banner`; a range slug must not produce that exact
    // key or the two would overwrite each other.
    const slots = ["Core Collection", "0% Nicotine"].map((r) =>
      rangeBannerSlot("crush", r)
    );
    expect(slots).not.toContain("crush_banner");
  });

  it("survives a range name that is mostly punctuation", () => {
    expect(rangeBannerSlot("crush", "0% Nicotine")).toBe("crush_banner_0-nicotine");
  });
});

describe("banner aspect ratio", () => {
  const DEFAULT_ASPECT = 16 / 9;
  /** Mirrors PinnedBanner: measured ratio when known, default until then. */
  const ratio = (natural: number | null) => natural ?? DEFAULT_ASPECT;

  it("uses the file's own proportions once measured", () => {
    expect(ratio(2400 / 800)).toBeCloseTo(3);
    expect(ratio(1000 / 1000)).toBe(1);
  });

  it("falls back to 16:9 before the image has loaded", () => {
    // Without a default the section would have zero height on first paint and
    // the page below would jump once the image arrived.
    expect(ratio(null)).toBeCloseTo(16 / 9);
  });
});
