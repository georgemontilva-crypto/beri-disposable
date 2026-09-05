export type Flavor = {
  name: string;
  slug: string;
  slot: string; // image slot key for admin-managed images
  /** Optional grouping shown on the product page, e.g. "Summer Edition". */
  edition?: string;
  /** Taste family. Derived from the name unless set explicitly. */
  profile: FlavorProfile;
};

/** Product identifiers used in URLs (/products/:key). */
export type ProductKey = "crush" | "cliq" | "cirql" | "eliquid";

export type Product = {
  key: ProductKey;
  name: string;
  tagline: string;
  /**
   * One or two sentences for the homepage summary card. The homepage is a
   * router, not a spec sheet — the full story lives on the product page, so
   * this stays short on purpose.
   */
  summary: string;
  /** Full copy, used on the product page only. */
  description: string;
  /** The single number that sells the product, shown large on the home card. */
  highlight: { value: string; unit: string };
  /** Three specs at most for the home card. `specs` holds the full list. */
  keySpecs: string[];
  /** Full spec list, shown as the small grid under the hero copy. */
  specs: { label: string; value: string }[];
  /**
   * The two or three features worth their own icon, shown as a band under the
   * hero. Kept separate from `specs` because these are marketing claims chosen
   * per product, not the complete data sheet — Crush leads with its screen and
   * charging speed, which aren't even in its spec list.
   */
  highlights: { label: string; value: string; iconSlot: string }[];
  /**
   * Brand accent, used for the eyebrow, the active tab and card hovers. One
   * colour per product rather than a palette per section: the accent is what
   * tells the four pages apart, so it has to stay consistent within a page.
   */
  accent: string;
  /**
   * Hue rotation applied to the ambient background glow, in degrees. Defaults
   * to a slice of the wheel derived from position.
   */
  glowHue?: number;
  /** Overrides both background lights outright, as "r g b" strings. */
  glowColors?: [string, string];
  /**
   * What the non-edition range is called. Three products call it "Original";
   * the e-liquid sells a salt nic line instead.
   */
  baseRangeLabel: string;
  /** Media slot for the product's own lockup, shown in place of the h1. */
  logoSlot: string;
  /** Media slot for a tiling brand pattern used behind the flavour section. */
  textureSlot: string;
  /** Tall, full-bleed shot for the homepage panel. */
  panelSlot: string;
  /** Optional short loop that plays over the panel image while it is open. */
  panelVideoSlot: string;
  heroSlot: string;
  /**
   * Media slot holding the interactive 3D model (.glb / .gltf).
   * When empty in the DB, ProductViewer3D renders its placeholder state.
   */
  modelSlot: string;
  flavors: Flavor[];
};

/** Taste families used to filter the flavour wall. */
export const FLAVOR_PROFILES = ["Ice", "Fruit", "Sweet", "Mint", "Other"] as const;
export type FlavorProfile = (typeof FLAVOR_PROFILES)[number];

/**
 * Derives a taste family from the flavour name.
 *
 * Rules are ordered because names overlap: "Miami Mint" is minty, "Blue Razz
 * Ice" is a fruit but the ice is what you taste first, so ice wins over fruit
 * and mint wins over ice. Derived rather than hand-tagged so a new flavour
 * lands in a sensible bucket the moment it is added; anything misfiled can be
 * corrected with an explicit `profile` on the flavour.
 */
function deriveProfile(name: string): FlavorProfile {
  const n = name.toLowerCase();
  // No word boundary: "Minty O's" is mint, and a strict \bmint\b would drop it
  // through every other rule and land it in "Other".
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

/** Media slot for an edition's own background pattern, if one is uploaded. */
export function editionTextureSlot(productKey: string, edition: string): string {
  return `${productKey}_texture_${toSlug(edition)}`;
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildFlavors(
  productKey: string,
  names: string[],
  edition?: string,
  /**
   * Prefix for the slug and media slot. Needed when a range reuses names that
   * already exist elsewhere in the same product — the Cliq batteries share four
   * names with its pods, and without a prefix both would resolve to the same
   * image slot and show the same photo.
   */
  slugPrefix = ""
): Flavor[] {
  return names.map((name) => {
    const slug = `${slugPrefix}${toSlug(name)}`;
    return {
      name,
      slug,
      slot: `${productKey}_flavor_${slug}`,
      profile: deriveProfile(name),
      ...(edition ? { edition } : {}),
    };
  });
}

/* ─── Beri Crush ──────────────────────────────────────────────────────────── */

export const BERI_CRUSH: Product = {
  key: "crush",
  name: "Beri Crush",
  tagline: "Auto-Adaptive Draw.",
  summary:
    "The flagship. Quad-mesh coil and up to 40W of auto-adaptive power, in the widest flavor range Beri makes.",
  description:
    "Beri Crush reads your draw and adapts power in real time, delivering up to 40W through a quad-mesh coil. Up to 50,000 puffs of consistent flavor density, with a full-color display and the broadest flavor library in the line-up, including Summer and Winter limited editions.",
  highlight: { value: "50K", unit: "Puffs" },
  keySpecs: ["Quad-Mesh Coil", "Up to 40W Power", "Auto-Adaptive Draw"],
  specs: [
    { label: "Puffs", value: "Up to 50,000" },
    { label: "Nicotine", value: "5%" },
    { label: "Coil", value: "Quad-Mesh" },
    { label: "Power", value: "Up to 40W" },
    { label: "Draw", value: "Auto-Adaptive" },
    { label: "Origin", value: "Designed in USA" },
  ],
  accent: "#4ade80",
  baseRangeLabel: "Original",
  logoSlot: "crush_logo",
  textureSlot: "crush_texture",
  panelSlot: "crush_panel",
  panelVideoSlot: "crush_panel_video",
  highlights: [
    { value: "Interactive", label: "HD Screen", iconSlot: "crush_icon_hd_screen" },
    { value: "2.5x", label: "Charging Speed", iconSlot: "crush_icon_charging" },
    { value: "Quad Coil", label: "Technology", iconSlot: "crush_icon_quad_coil" },
  ],
  heroSlot: "crush_hero",
  modelSlot: "crush_model_3d",
  flavors: [
    ...buildFlavors("crush", [
      "Banana Taffy",
      "Blue Razz Ice",
      "Cherry B-Pop",
      "Grape Ice",
      "Green Apple",
      "Mango Bomb",
      "Miami Mint",
      "Strawberry Cream",
      "Strawberry Watermelon",
      "Super Mint",
      "Triple Berry",
      "Watermelon Ice",
      "White Strawberry",
    ]),
    ...buildFlavors(
      "crush",
      [
        "Berry Peach Gush",
        "Blue Coconut",
        "Blueberry Watermelon",
        "Pineapple Passion Punch",
        "Sour Watermelon Gami",
      ],
      "Summer Edition"
    ),
    ...buildFlavors(
      "crush",
      ["Alaskan Mint", "Cherry Cola Gami", "Cran Apple Smash", "Punch Ice", "White Gami"],
      "Winter Edition"
    ),
    ...buildFlavors(
      "crush",
      [
        "Blue Sour",
        "Juicy Peach",
        "Melon Dragon Slush",
        "OG Watermelon",
        "Polar Ice",
        "Sour Neon Fab",
        "Watermelon Refresh",
      ],
      "Graffiti Edition"
    ),
    // All five repeat a regular Crush flavour, so they need their own slug
    // prefix or both would resolve to the same media slot.
    ...buildFlavors(
      "crush",
      [
        "Blue Razz Ice",
        "Grape Ice",
        "Miami Mint",
        "Strawberry Watermelon",
        "Triple Berry",
      ],
      "Zero Nicotine",
      "zero-"
    ),
  ],
};


/* ─── Beri Cliq ───────────────────────────────────────────────────────────── */

export const BERI_CLIQ: Product = {
  key: "cliq",
  name: "Beri Cliq",
  tagline: "Find Your Cliq.",
  summary:
    "A refillable pod system. Swap flavors in seconds on a 900mAh battery, with an 18mL pre-filled 360° crystal tank.",
  description:
    "Beri Cliq separates the battery from the pod, so one device carries your whole flavor rotation. An 18mL pre-filled 360° crystal tank clicks into a 900mAh USB-C battery, running a dual mesh coil with dual power modes for up to 50,000 puffs. Batteries come in six colors.",
  highlight: { value: "50K", unit: "Puffs" },
  keySpecs: ["Refillable Pod System", "360° Crystal Tank", "900mAh USB-C"],
  specs: [
    { label: "Puffs", value: "Up to 50,000" },
    { label: "Nicotine", value: "5%" },
    { label: "Coil", value: "Dual Mesh" },
    { label: "E-Liquid", value: "18 mL Pre-Filled" },
    { label: "Battery", value: "900mAh USB-C" },
    { label: "Tank", value: "360° Crystal" },
    { label: "Modes", value: "Dual-Power" },
    { label: "Pod", value: "Refillable" },
  ],
  accent: "#22d3ee",
  baseRangeLabel: "Original",
  logoSlot: "cliq_logo",
  textureSlot: "cliq_texture",
  panelSlot: "cliq_panel",
  panelVideoSlot: "cliq_panel_video",
  highlights: [
    { value: "360°", label: "Crystal Tank", iconSlot: "cliq_icon_tank" },
    { value: "Dual Mesh", label: "Coil", iconSlot: "cliq_icon_coil" },
    { value: "900mAh", label: "USB-C Battery", iconSlot: "cliq_icon_battery" },
  ],
  heroSlot: "cliq_hero",
  modelSlot: "cliq_model_3d",
  flavors: [
    ...buildFlavors("cliq", [
    "Alaskan Mint",
    "Banana Ice",
    "Black Razz Ice",
    "Blue Rancher",
    "Blue Razz Ice",
    "Clear",
    "Grape Ice",
    "Green Apple",
    "Mango Bomb",
    "Miami Mint",
    "Peach Ice",
    "Punch Ice",
    "Sour Neon Fab",
    "Super Mint",
    "Tobacco",
    "Triple Berry",
    "Watermelon BG",
    "Watermelon Gami",
    "White Gami",
    "White Strawberry",
    ]),
    ...buildFlavors(
      "cliq",
      [
        "Original",
        "Blue Razz",
        "Grape Ice",
        "White Strawberry",
        "Watermelon Ice",
        "Green Apple",
      ],
      "Batteries",
      "battery-"
    ),
  ],
};

/** Ready-to-vape kits (battery + pod). */
export const CLIQ_KITS = [
  "Blue Razz Ice",
  "Grape Ice",
  "Miami Mint",
  "Peach Ice",
  "Super Mint",
  "Watermelon Ice",
  "White Gami",
  "White Strawberry",
];

/* ─── Beri Cirql ──────────────────────────────────────────────────────────── */

export const BERI_CIRQL: Product = {
  key: "cirql",
  name: "Beri Cirql",
  tagline: "Authentic Shisha Flavor.",
  summary:
    "Hookah, without the setup. 150,000 puffs of authentic shisha flavor through a quad mesh coil.",
  description:
    "Beri Cirql brings the shisha lounge into a disposable. Built around authentic hookah flavor profiles like double apple, lady killer and love 66, with a quad mesh coil rated for 150,000 puffs. The longest-running device Beri makes by a wide margin.",
  highlight: { value: "150K", unit: "Puffs" },
  keySpecs: ["Authentic Shisha Flavor", "Quad Mesh Coil", "Made in USA"],
  specs: [
    { label: "Puffs", value: "150,000" },
    { label: "Coil", value: "Quad Mesh" },
    { label: "Flavor", value: "Authentic Shisha" },
    { label: "Origin", value: "USA" },
  ],
  accent: "#e0b44a",
  // Both lights in gold: amber and a deeper bronze.
  glowColors: ["224 180 74", "196 132 40"],
  baseRangeLabel: "Original",
  logoSlot: "cirql_logo",
  textureSlot: "cirql_texture",
  panelSlot: "cirql_panel",
  panelVideoSlot: "cirql_panel_video",
  highlights: [
    { value: "150K", label: "Puffs", iconSlot: "cirql_icon_puffs" },
    { value: "Quad Mesh", label: "Coil", iconSlot: "cirql_icon_coil" },
    { value: "Authentic", label: "Shisha Flavor", iconSlot: "cirql_icon_shisha" },
  ],
  heroSlot: "cirql_hero",
  modelSlot: "cirql_model_3d",
  flavors: buildFlavors("cirql", [
    "Blue Razz",
    "Blueberry Ice",
    "Cool Mint",
    "Double Apple",
    "Grape Ice",
    "Lady Killer",
    "Lemon Mint",
    "Love 66",
    "Lucid Dreams",
    "Peach Ice",
    "Peach Mango Watermelon",
    "Strawberry Punch",
    "Watermelon Ice",
  ]),
};

/* ─── Beri E-Liquid ───────────────────────────────────────────────────────── */

export const BERI_ELIQUID: Product = {
  key: "eliquid",
  name: "Beri E-Liquid",
  tagline: "The Flavor, Bottled.",
  summary:
    "The Beri flavor library for your own device. 30 mL bottles in 25 mg or 50 mg, bottled in California.",
  description:
    "The same flavor engineering behind the Beri disposables, bottled for your own setup. 30 mL child-resistant bottles in 25 mg and 50 mg nicotine salt, blended and bottled in California, across twelve profiles.",
  highlight: { value: "30", unit: "mL Bottle" },
  keySpecs: ["25 mg & 50 mg", "Nicotine Salt", "Bottled in California"],
  specs: [
    { label: "Bottle Size", value: "30 mL" },
    { label: "Nicotine", value: "25 mg / 50 mg" },
    { label: "Type", value: "Nicotine Salt" },
    { label: "Origin", value: "Bottled in California" },
    { label: "Cap", value: "Child-Resistant" },
  ],
  accent: "#ec4899",
  baseRangeLabel: "Salt Nic",
  logoSlot: "eliquid_logo",
  textureSlot: "eliquid_texture",
  panelSlot: "eliquid_panel",
  panelVideoSlot: "eliquid_panel_video",
  highlights: [
    { value: "30 mL", label: "Bottle", iconSlot: "eliquid_icon_bottle" },
    { value: "25 / 50 mg", label: "Nicotine Salt", iconSlot: "eliquid_icon_nicotine" },
    { value: "California", label: "Bottled In", iconSlot: "eliquid_icon_california" },
  ],
  heroSlot: "eliquid_hero",
  modelSlot: "eliquid_model_3d",
  flavors: buildFlavors("eliquid", [
    "Apple Caramel Pop",
    "Apple Juice",
    "Blue Frost",
    "Citrus Squeeze",
    "Grape Drank",
    "Lime Frost",
    "Minty O's",
    "Mother's Milk",
    "Pistachio Gelato",
    "Red Ropes",
    "Sunni Drank",
    "Winter Green Saverz",
  ]),
};

/* ─── Catalogue ───────────────────────────────────────────────────────────── */

export const PRODUCTS: Product[] = [BERI_CRUSH, BERI_CLIQ, BERI_CIRQL, BERI_ELIQUID];

export function getProductByKey(key: string): Product | undefined {
  return PRODUCTS.find((p) => p.key === key);
}

/** Next product in the line-up, wrapping around. Powers the bottom nav CTA. */
export function getNextProduct(key: string): Product {
  const i = PRODUCTS.findIndex((p) => p.key === key);
  return PRODUCTS[(i + 1) % PRODUCTS.length] ?? PRODUCTS[0];
}
