export type Flavor = {
  name: string;
  slug: string;
  slot: string; // image slot key for admin-managed images
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

export type Product = {
  key: "crush" | "cliq";
  name: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  heroSlot: string;
  specSlots: SpecSlot[];
  flavors: Flavor[];
};

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildFlavors(productKey: string, names: string[]): Flavor[] {
  return names.map((name) => {
    const slug = toSlug(name);
    return { name, slug, slot: `${productKey}_flavor_${slug}` };
  });
}

export const BERI_CRUSH: Product = {
  key: "crush",
  name: "Beri Crush",
  tagline: "World's 1st Auto-Adaptive Power.",
  description:
    "The Beri Crush redefines high-capacity disposables with World's 1st Auto-Adaptive Power technology. Engineered for consistency from the first puff to the last, with an Interactive HD Screen, blazing 2.5x Charging Speed and Quad Coil Technology for unmatched flavor intensity.",
  specs: [
    { label: "Crush Mode", value: "25K Puffs" },
    { label: "Normal Mode", value: "50K Puffs" },
    { label: "Screen", value: "Interactive HD" },
    { label: "Charging", value: "2.5x Speed" },
    { label: "Coil", value: "Quad Coil Tech" },
    { label: "Power", value: "Auto-Adaptive" },
  ],
  heroSlot: "crush_hero",
  specSlots: [
    { slot: "crush_spec_main", label: "Multi Curved Design", tall: true },
    { slot: "crush_spec_coil", label: "Quad Coil Technology" },
    { slot: "crush_spec_screen", label: "Interactive HD Screen" },
    { slot: "crush_spec_bottom", label: "2.5x Charging Speed" },
    { slot: "crush_spec_puffs", label: "50K Puffs Normal Mode", bigValue: "50K", bigUnit: "Puffs" },
    { slot: "crush_spec_power", label: "Auto-Adaptive Power", bigValue: "AAP", bigUnit: "Technology" },
  ],
  flavors: buildFlavors("crush", [
    "Tropical Gummy",
    "Triple Berry",
    "Watermelon Ice",
    "Watermelon Refresh",
    "Banana Taffy",
    "White Strawberry",
    "Blue Razz Ice",
    "Blue Sour",
    "Cherry B-Pop",
    "Green Apple",
    "Mango Bomb",
    "Miami Mint",
    "Polar Ice",
    "Strawberry Cream",
    "Strawberry Watermelon",
  ]),
};

export const BERI_CLIQ: Product = {
  key: "cliq",
  name: "Beri Cliq",
  tagline: "Find Your Cliq.",
  description:
    "The Beri Cliq pod system lets you cliq between flavors in seconds. Compact, refined, and built around a satisfying magnetic connection with a 360° Crystal Tank, LED Display and Dual Mesh Coil for a premium experience every time.",
  specs: [
    { label: "Cliq Mode", value: "25K Puffs" },
    { label: "Normal Mode", value: "50K Puffs" },
    { label: "Tank", value: "360° Crystal" },
    { label: "Charging", value: "2.5x Speed" },
    { label: "Display", value: "LED Display" },
    { label: "Coil", value: "Dual Mesh" },
    { label: "Pod", value: "Refillable" },
  ],
  heroSlot: "cliq_hero",
  specSlots: [
    { slot: "cliq_spec_main", label: "Multi Curved Design", tall: true },
    { slot: "cliq_spec_tank", label: "360° Crystal Tank" },
    { slot: "cliq_spec_coil", label: "Dual Mesh Coil" },
    { slot: "cliq_spec_bottom", label: "Light On/Off" },
    { slot: "cliq_spec_puffs", label: "50K Puffs Normal Mode", bigValue: "50K", bigUnit: "Puffs" },
    { slot: "cliq_spec_display", label: "LED Display", bigValue: "LED", bigUnit: "Display" },
  ],
  flavors: buildFlavors("cliq", [
    "Tropical Gummy",
    "Triple Berry",
    "Watermelon Ice",
    "Banana Taffy",
    "White Strawberry",
    "Blue Razz Ice",
    "Cherry B-Pop",
    "Green Apple",
    "Mango Bomb",
    "Miami Mint",
    "Polar Ice",
    "Strawberry Cream",
    "Cool Mint",
    "Peach Ice",
    "Grape Burst",
    "Lush Ice",
    "Pineapple Coconut",
    "Sour Apple",
    "Berry Blast",
    "Banana",
  ]),
};

export const PRODUCTS: Product[] = [BERI_CRUSH, BERI_CLIQ];

export function getProductByKey(key: string): Product | undefined {
  return PRODUCTS.find((p) => p.key === key);
}
