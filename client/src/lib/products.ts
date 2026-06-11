export type Flavor = {
  name: string;
  slug: string;
  slot: string; // image slot key for admin-managed images
};

export type Product = {
  key: "crush" | "cliq";
  name: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  heroSlot: string;
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
  tagline: "Bold flavor. Crushed to perfection.",
  description:
    "The Beri Crush delivers a smooth, high-capacity experience with vibrant, true-to-taste flavors. Each device is engineered for consistency from the first puff to the last.",
  specs: [
    { label: "Puffs", value: "Up to 25,000" },
    { label: "E-liquid", value: "Premium salt nic" },
    { label: "Battery", value: "Rechargeable" },
    { label: "Display", value: "Smart screen" },
  ],
  heroSlot: "crush_hero",
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
  tagline: "Click in. Switch up. Never stop.",
  description:
    "The Beri Cliq pod system lets you cliq between flavors in seconds. Compact, refined, and built around a satisfying magnetic connection with a sleek monochrome finish.",
  specs: [
    { label: "System", value: "Pod-based" },
    { label: "Connection", value: "Magnetic Cliq" },
    { label: "Battery", value: "Rechargeable" },
    { label: "Pods", value: "Interchangeable" },
  ],
  heroSlot: "cliq_hero",
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
