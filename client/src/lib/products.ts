export type Flavor = {
  name: string;
  slug: string;
  slot: string; // image slot key for admin-managed images
  /** Optional grouping shown on the product page, e.g. "Summer Edition". */
  edition?: string;
};

export type SpecSlot = {
  slot: string;   // image slot key
  label: string;  // caption shown under the image in the bento grid
  /** Optional: show a large number/value prominently (e.g. "50K") */
  bigValue?: string;
  /** Optional: unit/description after bigValue (e.g. "Puffs") */
  bigUnit?: string;
  /** If true, this cell spans 2 columns in the bento grid */
  wide?: boolean;
  /** If true, this cell spans 2 rows */
  tall?: boolean;
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
  specs: { label: string; value: string }[];
  /** Packaging info from the trade sheets, shown on the product page. */
  packaging?: { label: string; value: string }[];
  heroSlot: string;
  /**
   * Media slot holding the interactive 3D model (.glb / .gltf).
   * When empty in the DB, ProductViewer3D renders its placeholder state.
   */
  modelSlot: string;
  specSlots: SpecSlot[];
  flavors: Flavor[];
};

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildFlavors(
  productKey: string,
  names: string[],
  edition?: string
): Flavor[] {
  return names.map((name) => ({
    name,
    slug: toSlug(name),
    slot: `${productKey}_flavor_${toSlug(name)}`,
    ...(edition ? { edition } : {}),
  }));
}

/* ─── Beri Crush ──────────────────────────────────────────────────────────── */

export const BERI_CRUSH: Product = {
  key: "crush",
  name: "Beri Crush",
  tagline: "Auto-Adaptive Draw.",
  summary:
    "The flagship. Quad-mesh coil and up to 40W of auto-adaptive power, reading your draw in real time.",
  description:
    "Beri Crush reads your draw and adapts power in real time, delivering up to 40W through a quad-mesh coil. Up to 50,000 puffs of consistent flavor density, with a full-color display and thirteen signature flavors.",
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
  packaging: [
    { label: "Display Box", value: "5 single pieces" },
    { label: "Master Box", value: "20 displays" },
  ],
  heroSlot: "crush_hero",
  modelSlot: "crush_model_3d",
  specSlots: [
    { slot: "crush_spec_main", label: "Multi Curved Design", tall: true },
    { slot: "crush_spec_coil", label: "Quad-Mesh Coil" },
    { slot: "crush_spec_screen", label: "Full-Color Display" },
    { slot: "crush_spec_power", label: "Up to 40W Power" },
    { slot: "crush_spec_puffs", label: "Up to 50,000 Puffs", bigValue: "50K", bigUnit: "Puffs" },
    { slot: "crush_spec_draw", label: "Auto-Adaptive Draw", bigValue: "40W", bigUnit: "Max Power" },
  ],
  flavors: buildFlavors("crush", [
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
  highlight: { value: "18", unit: "mL Pod" },
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
  packaging: [
    { label: "Display Box", value: "5 single boxes" },
    { label: "Master Case: Kits", value: "16 displays" },
    { label: "Master Case: Pods", value: "20 displays" },
  ],
  heroSlot: "cliq_hero",
  modelSlot: "cliq_model_3d",
  specSlots: [
    { slot: "cliq_spec_main", label: "Pod & Battery System", tall: true },
    { slot: "cliq_spec_tank", label: "360° Crystal Tank" },
    { slot: "cliq_spec_coil", label: "Dual Mesh Coil" },
    { slot: "cliq_spec_battery", label: "900mAh USB-C Battery" },
    { slot: "cliq_spec_puffs", label: "18 mL Pre-Filled Pod", bigValue: "18", bigUnit: "mL" },
    { slot: "cliq_spec_modes", label: "Dual-Power Modes", bigValue: "50K", bigUnit: "Puffs" },
  ],
  flavors: buildFlavors("cliq", [
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
};

/** Battery colors available for the Cliq. */
export const CLIQ_BATTERY_COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Blue", hex: "#1a9fb5" },
  { name: "Green", hex: "#2fa84f" },
  { name: "Orange", hex: "#f07d1a" },
  { name: "Purple", hex: "#6b3fc4" },
  { name: "Red", hex: "#c8202e" },
];

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
    "Beri Cirql brings the shisha lounge into a disposable. Built around authentic hookah flavor profiles like double apple, grape drank and love 66, with a quad mesh coil rated for 150,000 puffs. The longest-running device Beri makes by a wide margin.",
  highlight: { value: "150K", unit: "Puffs" },
  keySpecs: ["Authentic Shisha Flavor", "Quad Mesh Coil", "Made in USA"],
  specs: [
    { label: "Puffs", value: "150,000" },
    { label: "Coil", value: "Quad Mesh" },
    { label: "Flavor", value: "Authentic Shisha" },
    { label: "Origin", value: "USA" },
  ],
  heroSlot: "cirql_hero",
  modelSlot: "cirql_model_3d",
  specSlots: [
    { slot: "cirql_spec_main", label: "Hookah-Inspired Form", tall: true },
    { slot: "cirql_spec_coil", label: "Quad Mesh Coil" },
    { slot: "cirql_spec_flavor", label: "Authentic Shisha Flavor" },
    { slot: "cirql_spec_display", label: "E-Liquid Level Display" },
    { slot: "cirql_spec_puffs", label: "150,000 Puffs", bigValue: "150K", bigUnit: "Puffs" },
    { slot: "cirql_spec_usa", label: "Made in USA", bigValue: "USA", bigUnit: "Made In" },
  ],
  flavors: buildFlavors("cirql", [
    "Apple Caramel Pop",
    "Blue Razz",
    "Cool Mint",
    "Double Apple",
    "Grape Drank",
    "Lemon Mint",
    "Lime Frost",
    "Love 66",
    "Lucid Dreams",
    "Mixed Berries",
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
  heroSlot: "eliquid_hero",
  modelSlot: "eliquid_model_3d",
  specSlots: [
    { slot: "eliquid_spec_main", label: "30 mL Bottle", tall: true },
    { slot: "eliquid_spec_nic", label: "25 mg & 50 mg Options" },
    { slot: "eliquid_spec_cap", label: "Child-Resistant Cap" },
    { slot: "eliquid_spec_ca", label: "Bottled in California" },
    { slot: "eliquid_spec_size", label: "30 mL Bottle", bigValue: "30", bigUnit: "mL" },
    { slot: "eliquid_spec_flavors", label: "Flavor Profiles", bigValue: "12", bigUnit: "Flavors" },
  ],
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
