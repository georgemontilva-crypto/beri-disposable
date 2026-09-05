export type Flavor = {
  name: string;
  slug: string;
  slot: string; // image slot key for admin-managed images
  /** Optional grouping shown on the product page, e.g. "Summer Edition". */
  edition?: string;
  /** Taste family. Derived from the name unless set explicitly. */
  profile: FlavorProfile;
  /** One line shown beside the featured shot. */
  description?: string;
  /** Two or three tasting keywords, shown as a row under the description. */
  notes?: string[];
};

/** A flavour as authored: a bare name, or a name with its copy. */
type FlavorInput =
  | string
  | { name: string; description?: string; notes?: string[] };

/** Product identifiers used in URLs (/products/:key). */
export type ProductKey = "crush" | "cliq" | "cirql" | "eliquid";

export type Product = {
  key: ProductKey;
  name: string;
  tagline: string;
  /** Small line above the logo. Not every product is a disposable. */
  eyebrow: string;
  /** Headline that opens the product description. */
  headline: string;
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
  /** Heading of the flavour section. Not always "<name> Flavors". */
  flavorTitle: string;
  /** Line under the flavour section heading. */
  flavorIntro: string;
  /**
   * Expandable explainer under the spec cards. Kept out of `specs` because
   * these are explanations, not values: a spec answers "what", these answer
   * "how it behaves".
   */
  howItWorks?: { title: string; body: string }[];
  /**
   * Offer highlighted inside one range of the flavour section. Scoped to a
   * range because an offer that applies to pods shouldn't follow the visitor
   * into the batteries tab.
   */
  promo?: { range: string; badge: string; title: string; body: string };
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
   * What the non-edition range is called. Crush and Cirql call it the Core
   * Collection, Cliq's base range is its pods, and the e-liquid is salt nic.
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

/**
 * Colour of the glow behind the featured flavour, as "r g b".
 *
 * Derived from the flavour's own name rather than stored per flavour: the list
 * runs to seventy-odd entries across four products, and a table of hand-picked
 * colours would drift out of sync the first time a flavour is renamed.
 *
 * Rules are ordered because names combine ingredients. "Blue Razz Ice" is both
 * a berry and an ice, and the blue is what the eye expects; "Strawberry
 * Watermelon" leads with strawberry. First match wins, so the more specific
 * pairings sit above the generic fruits.
 */
export function flavorGlow(name: string): string {
  const n = name.toLowerCase();
  const rules: [RegExp, string][] = [
    [/blue razz|blue sour|blue coconut/, "56 132 255"],
    [/grape/, "150 90 240"],
    [/strawberry/, "255 70 100"],
    [/watermelon/, "255 84 122"],
    [/cherry/, "230 45 70"],
    [/blueberry|black razz|razz|berry|berries/, "170 70 220"],
    [/mango|peach|caramel|sunni|orange/, "255 150 50"],
    [/banana|lemon|citrus|sour neon|gold/, "245 205 60"],
    [/cran/, "205 50 70"],
    [/lime|apple|melon|green/, "110 210 90"],
    [/mint|polar|frost|alaskan|cool/, "70 220 210"],
    [/coconut|cream|milk|gelato|pistachio/, "235 210 170"],
    [/tobacco|cola/, "190 130 70"],
    [/punch|pop|taffy|gami|ropes|candy/, "255 105 180"],
    [/lucid|love|dream/, "200 120 255"],
    [/lady killer|punch/, "225 55 85"],
    [/ice|clear|frost/, "120 190 255"],
  ];
  for (const [re, rgb] of rules) if (re.test(n)) return rgb;
  return "160 160 170";
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildFlavors(
  productKey: string,
  names: FlavorInput[],
  edition?: string,
  /**
   * Prefix for the slug and media slot. Needed when a range reuses names that
   * already exist elsewhere in the same product — the Cliq batteries share four
   * names with its pods, and without a prefix both would resolve to the same
   * image slot and show the same photo.
   */
  slugPrefix = ""
): Flavor[] {
  return names.map((entry) => {
    const f = typeof entry === "string" ? { name: entry } : entry;
    const slug = `${slugPrefix}${toSlug(f.name)}`;
    return {
      name: f.name,
      slug,
      slot: `${productKey}_flavor_${slug}`,
      profile: deriveProfile(f.name),
      ...(f.description ? { description: f.description } : {}),
      ...(f.notes ? { notes: f.notes } : {}),
      ...(edition ? { edition } : {}),
    };
  });
}

/* ─── Beri Crush ──────────────────────────────────────────────────────────── */

export const BERI_CRUSH: Product = {
  key: "crush",
  name: "Beri Crush",
  tagline: "Auto-Adaptive Draw.",
  eyebrow: "Beri Disposable",
  headline: "AUTO-ADAPTIVE POWER.",
  summary:
    "The flagship. Quad-mesh coil and up to 40W of auto-adaptive power, in the widest flavor range Beri makes.",
  description:
    "BERI CRUSH automatically adjusts power from 15 to 25W based on your draw. Activate CRUSH Mode for a 40W power boost, backed by quad-mesh performance, adjustable airflow, and a 1.77\" HD display.",
  highlight: { value: "50K", unit: "Puffs" },
  keySpecs: ["Quad-Mesh Coil", "Up to 40W Power", "Auto-Adaptive Draw"],
  specs: [
    { label: "Puffs", value: "Up to 50,000" },
    { label: "Nicotine", value: "5%" },
    { label: "Coil", value: "Quad-Mesh" },
    { label: "Power", value: "Up to 40W" },
    { label: "Draw", value: "Auto-Adaptive" },
    { label: "Battery", value: "1,000 mAh" },
    { label: "Modes", value: "15-25W Adaptive / 40W CRUSH" },
    { label: "Airflow", value: "Adjustable" },
    { label: "Origin", value: "Designed in USA" },
  ],
  flavorTitle: "BERI CRUSH FLAVORS",
  flavorIntro: "35 Flavors. One CRUSH lineup. Select a flavor to explore.",
  howItWorks: [
    {
      title: "Adaptive Power",
      body: "In Normal Mode, CRUSH responds to your draw and automatically adjusts power between 15 and 25W for a balanced experience.",
    },
    {
      title: "CRUSH Mode",
      body: "Activate CRUSH Mode to increase output up to 40W when you want stronger performance.",
    },
    {
      title: "Quad-Mesh Technology",
      body: "A quad-mesh coil system is designed to deliver consistent vapor and flavor across the life of the device.",
    },
    {
      title: "Adjustable Airflow",
      body: "Fine-tune the airflow to customize your draw preference.",
    },
    {
      title: '1.77" HD Display',
      body: "Monitor device information and settings directly from the full-color screen.",
    },
    {
      title: "1,000 mAh Battery",
      body: "Rechargeable battery capacity designed to support the device through its extended-use format.",
    },
  ],
  accent: "#4ade80",
  baseRangeLabel: "Core Collection",
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
      {
        name: "Banana Taffy",
        description:
          "Sweet banana candy with a smooth, creamy finish.",
        notes: ["Banana", "Candy", "Sweet"],
      },
      {
        name: "Blue Razz Ice",
        description:
          "Tangy blue raspberry with a crisp icy finish.",
        notes: ["Blue Razz", "Tart", "Ice"],
      },
      {
        name: "Cherry B-Pop",
        description:
          "Bright cherry candy with a sweet, punchy finish.",
        notes: ["Cherry", "Candy", "Sweet"],
      },
      {
        name: "Grape Ice",
        description:
          "Bold grape flavor with a crisp, icy finish.",
        notes: ["Grape", "Sweet", "Cool"],
      },
      {
        name: "Green Apple",
        description:
          "Crisp green apple with a bright sweet-and-tart bite.",
        notes: ["Apple", "Tart", "Crisp"],
      },
      {
        name: "Mango Bomb",
        description:
          "Juicy tropical mango with a bold, fruit-forward finish.",
        notes: ["Mango", "Tropical", "Juicy"],
      },
      {
        name: "Miami Mint",
        description:
          "Clean, refreshing mint with a smooth cooling finish.",
        notes: ["Mint", "Fresh", "Cool"],
      },
      {
        name: "Strawberry Cream",
        description:
          "Ripe strawberry layered with a smooth, creamy finish.",
        notes: ["Strawberry", "Creamy", "Sweet"],
      },
      {
        name: "Strawberry Watermelon",
        description:
          "Juicy watermelon blended with sweet ripe strawberry.",
        notes: ["Strawberry", "Watermelon", "Juicy"],
      },
      {
        name: "Super Mint",
        description:
          "An intense mint profile with an extra-cool finish.",
        notes: ["Mint", "Bold", "Extra Cool"],
      },
      {
        name: "Triple Berry",
        description:
          "A bold blend of sweet and tangy mixed berries.",
        notes: ["Mixed Berry", "Sweet", "Tart"],
      },
      {
        name: "Watermelon Ice",
        description:
          "Juicy watermelon balanced by a refreshing icy finish.",
        notes: ["Watermelon", "Juicy", "Ice"],
      },
      {
        name: "White Strawberry",
        description:
          "Smooth, sweet strawberry with a softer fruit-forward finish.",
        notes: ["Strawberry", "Sweet", "Smooth"],
      },
    ]),
    ...buildFlavors(
      "crush",
      [
        {
          name: "Berry Peach Gush",
          description:
            "Ripe peach blended with sweet mixed berries for a juicy, fruit-forward finish.",
          notes: ["Peach", "Berry", "Juicy"],
        },
        {
          name: "Blue Coconut",
          description:
            "Sweet blue raspberry paired with smooth, tropical coconut.",
          notes: ["Blue Razz", "Coconut", "Tropical"],
        },
        {
          name: "Blueberry Watermelon",
          description:
            "Sweet blueberry blended with crisp, juicy watermelon.",
          notes: ["Blueberry", "Watermelon", "Juicy"],
        },
        {
          name: "Pineapple Passion Punch",
          description:
            "Bright pineapple and sweet passion fruit come together in a bold tropical blend.",
          notes: ["Pineapple", "Passion Fruit", "Tropical"],
        },
        {
          name: "Sour Watermelon Gami",
          description:
            "Tangy watermelon candy with a sweet gummy-inspired finish.",
          notes: ["Watermelon", "Sour", "Candy"],
        },
      ],
      "Summer Edition"
    ),
    ...buildFlavors(
      "crush",
      [
        {
          name: "Alaskan Mint",
          description:
            "Sharp peppermint with a deep, frost-bitten finish.",
          notes: ["Mint", "Crisp", "Extra Cool"],
        },
        {
          name: "Cherry Cola Gami",
          description:
            "Sweet cherry cola with a chewy, gummy-inspired finish.",
          notes: ["Cherry", "Cola", "Candy"],
        },
        {
          name: "Cran Apple Smash",
          description:
            "Tart cranberry smashed together with crisp orchard apple.",
          notes: ["Cranberry", "Apple", "Tart"],
        },
        {
          name: "Punch Ice",
          description:
            "Bright fruit punch chilled to a sharp, frosty finish.",
          notes: ["Fruit Punch", "Sweet", "Ice"],
        },
        {
          name: "White Gami",
          description:
            "Soft white gummy candy with a smooth, sugary finish.",
          notes: ["Gummy", "Candy", "Smooth"],
        },
      ],
      "Winter Edition"
    ),
    ...buildFlavors(
      "crush",
      [
        {
          name: "Blue Sour",
          description:
            "A bold blue candy profile with a bright, tangy sour finish.",
          notes: ["Blue Candy", "Sour", "Tangy"],
        },
        {
          name: "Juicy Peach",
          description:
            "Ripe peach flavor with a smooth, juicy sweetness.",
          notes: ["Peach", "Juicy", "Sweet"],
        },
        {
          name: "Melon Dragon Slush",
          description:
            "Sweet melon and exotic dragon fruit with a frosty slush finish.",
          notes: ["Melon", "Dragon Fruit", "Frosty"],
        },
        {
          name: "OG Watermelon",
          description:
            "Classic juicy watermelon with a clean, refreshing finish.",
          notes: ["Watermelon", "Juicy", "Classic"],
        },
        {
          name: "Polar Ice",
          description:
            "An intensely cool profile with a crisp, refreshing finish.",
          notes: ["Icy", "Crisp", "Extra Cool"],
        },
        {
          name: "Sour Neon Fab",
          description:
            "A bright sour-candy blend with a punchy sweet-and-tart finish.",
          notes: ["Sour Candy", "Sweet", "Tart"],
        },
        {
          name: "Watermelon Refresh",
          description:
            "Juicy watermelon with a light, cooling finish.",
          notes: ["Watermelon", "Fresh", "Cool"],
        },
      ],
      "Graffiti Edition"
    ),
    // All five repeat a Core flavour, so they need their own slug prefix or
    // both would resolve to the same media slot.
    ...buildFlavors(
      "crush",
      [
        {
          name: "Blue Razz Ice",
          description:
            "Tangy blue raspberry with a crisp, icy finish, without nicotine.",
          notes: ["Blue Razz", "Tart", "Ice"],
        },
        {
          name: "Grape Ice",
          description:
            "Bold grape flavor with a crisp, cooling finish, without nicotine.",
          notes: ["Grape", "Sweet", "Cool"],
        },
        {
          name: "Miami Mint",
          description:
            "Clean, refreshing mint with a smooth cooling finish, without nicotine.",
          notes: ["Mint", "Fresh", "Cool"],
        },
        {
          name: "Strawberry Watermelon",
          description:
            "Sweet strawberry and juicy watermelon in a smooth, fruit-forward blend, without nicotine.",
          notes: ["Strawberry", "Watermelon", "Juicy"],
        },
        {
          name: "Triple Berry",
          description:
            "A bold blend of sweet and tangy berries, without nicotine.",
          notes: ["Mixed Berry", "Sweet", "Tart"],
        },
      ],
      "0% Nicotine",
      "zero-"
    ),
  ],
};


/* ─── Beri Cliq ───────────────────────────────────────────────────────────── */

export const BERI_CLIQ: Product = {
  key: "cliq",
  name: "BERI CLIQ",
  tagline: "Find Your Cliq.",
  eyebrow: "Pod System",
  headline: "ONE BATTERY. YOUR FLAVOR ROTATION.",
  summary:
    "A refillable pod system. Swap flavors in seconds on a 900mAh battery, with an 18mL pre-filled 360° crystal tank.",
  description:
    "BERI CLIQ pairs a rechargeable 900 mAh battery with interchangeable 18 mL pre-filled pods. A 360° crystal tank lets you see your e-liquid level, while dual-mesh technology, adjustable airflow, and two power modes deliver up to 50,000 puffs.",
  highlight: { value: "50K", unit: "Puffs" },
  keySpecs: ["Refillable Pod System", "360° Crystal Tank", "900mAh USB-C"],
  specs: [
    { label: "Puffs", value: "Up to 50,000" },
    { label: "Nicotine", value: "5%" },
    { label: "Coil", value: "Dual-Mesh" },
    { label: "E-Liquid", value: "18 mL Pre-Filled" },
    { label: "Battery", value: "900 mAh" },
    { label: "Tank", value: "360° Crystal" },
    { label: "Modes", value: "Normal / Eco Mode" },
    { label: "Pod", value: "Replaceable" },
  ],
  flavorTitle: "BERI CLIQ COLLECTION",
  flavorIntro: "14 flavors. 6 battery colors. Build your CLIQ.",
  promo: {
    range: "Pods",
    badge: "Limited Edition",
    title: "5 + 1",
    body: "Five pods and one limited edition battery, available on six of the fourteen flavors. While stocks last.",
  },
  howItWorks: [
    {
      title: "1. Start with the CLIQ Kit",
      body: "Includes the rechargeable battery and one pre-filled pod.",
    },
    {
      title: "2. Click in your pod",
      body: "The 18 mL pre-filled pod connects to the reusable CLIQ battery.",
    },
    {
      title: "3. Choose your mode",
      body: "Normal Mode prioritizes extended use. CLIQ Mode increases output for a stronger experience.",
    },
    {
      title: "4. Replace the pod",
      body: "When the pod is empty, keep the battery and insert a new compatible CLIQ pod.",
    },
  ],
  accent: "#22d3ee",
  baseRangeLabel: "Pods",
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
      {
        name: "Alaskan Mint",
        description:
          "Crisp mint with a clean, intensely cool finish.",
        notes: ["Mint", "Crisp", "Cool"],
      },
      {
        name: "Banana Ice",
        description:
          "Smooth banana sweetness balanced by a refreshing icy finish.",
        notes: ["Banana", "Sweet", "Ice"],
      },
      {
        name: "Black Razz Ice",
        description:
          "Dark raspberry with a tangy berry bite and cool finish.",
        notes: ["Raspberry", "Tart", "Ice"],
      },
      {
        name: "Blue Razz Ice",
        description:
          "Tangy blue raspberry with a crisp icy finish.",
        notes: ["Blue Razz", "Tart", "Ice"],
      },
      {
        name: "Clear",
        description:
          "A clean, understated profile with minimal added flavor.",
        notes: ["Clean", "Light", "Neutral"],
      },
      {
        name: "Grape Ice",
        description:
          "Bold grape sweetness balanced by a chilled finish.",
        notes: ["Grape", "Sweet", "Ice"],
      },
      {
        name: "Green Apple",
        description:
          "Crisp green apple with a bright sweet-and-tart bite.",
        notes: ["Apple", "Tart", "Crisp"],
      },
      {
        name: "Mango Bomb",
        description:
          "Bold tropical mango with a smooth, juicy finish.",
        notes: ["Mango", "Tropical", "Juicy"],
      },
      {
        name: "Miami Mint",
        description:
          "Fresh mint with a smooth, refreshing cooling finish.",
        notes: ["Mint", "Fresh", "Cool"],
      },
      {
        name: "Peach Ice",
        description:
          "Ripe peach sweetness paired with a light icy finish.",
        notes: ["Peach", "Sweet", "Ice"],
      },
      {
        name: "Punch Ice",
        description:
          "Sweet mixed fruit punch with a crisp icy finish.",
        notes: ["Fruit Punch", "Sweet", "Ice"],
      },
      {
        name: "Sour Neon Fab",
        description:
          "Bright sour-candy flavor with a bold sweet-and-tart finish.",
        notes: ["Sour Candy", "Sweet", "Tart"],
      },
      {
        name: "Super Mint",
        description:
          "Strong, refreshing mint with an intensely cool finish.",
        notes: ["Mint", "Fresh", "Extra Cool"],
      },
      {
        name: "Tobacco",
        description:
          "A classic tobacco-style profile with a smooth, familiar finish.",
        notes: ["Tobacco", "Rich", "Classic"],
      },
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
  name: "BERI CIRQL",
  tagline: "Authentic Shisha Flavor.",
  eyebrow: "E-Hookah Series",
  headline: "SHISHA, REIMAGINED.",
  summary:
    "Hookah, without the setup. 150,000 puffs of authentic shisha flavor through a quad mesh coil.",
  description:
    "BERI CIRQL brings the hookah-lounge flavor experience into a high-capacity disposable format. Built with quad-mesh technology and up to 150,000 puffs, CIRQL features shisha-inspired profiles such as Double Apple, Lady Killer and Love 66.",
  highlight: { value: "150K", unit: "Puffs" },
  keySpecs: ["Authentic Shisha Flavor", "Quad Mesh Coil", "Made in USA"],
  specs: [
    { label: "Puffs", value: "Up to 150,000" },
    { label: "Coil", value: "Quad-Mesh" },
    { label: "Profile", value: "Shisha-Inspired" },
    { label: "Modes", value: "Regular + Boost" },
  ],
  flavorTitle: "BERI CIRQL FLAVORS",
  flavorIntro: "13 flavors. Select one to explore.",
  howItWorks: [
    {
      title: "Shisha-Inspired Profiles",
      body: "Flavor profiles inspired by familiar hookah-lounge favorites, including Double Apple, Lady Killer and Love 66.",
    },
    {
      title: "Quad-Mesh Technology",
      body: "Designed for consistent flavor delivery across the extended-use format.",
    },
    {
      title: "Regular + Boost Modes",
      body: "Choose between the standard experience and increased output.",
    },
    {
      title: "Extended Format",
      body: "Designed for up to 150,000 puffs.",
    },
  ],
  accent: "#e0b44a",
  // Both lights in gold: amber and a deeper bronze.
  glowColors: ["224 180 74", "196 132 40"],
  baseRangeLabel: "Core Collection",
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
  name: "BERI E-LIQUID",
  tagline: "The Flavor, Bottled.",
  eyebrow: "Bottled E-Liquid",
  headline: "THE FLAVOR, BOTTLED.",
  summary:
    "The Beri flavor library for your own device. 30 mL bottles in 25 mg or 50 mg, bottled in California.",
  description:
    "The signature flavor profiles behind BERI, now available in bottled form. Each 30 mL nicotine salt e-liquid features a child-resistant cap and is available in 25 mg and 50 mg strengths across 12 flavors.",
  highlight: { value: "30", unit: "mL Bottle" },
  keySpecs: ["25 mg & 50 mg", "Nicotine Salt", "Bottled in California"],
  specs: [
    { label: "Bottle Size", value: "30 mL" },
    { label: "Nicotine", value: "25 mg / 50 mg" },
    { label: "Formula", value: "Nicotine Salt" },
    { label: "Flavors", value: "12" },
    { label: "Cap", value: "Child-Resistant" },
  ],
  flavorTitle: "BERI E-LIQUID FLAVORS",
  flavorIntro: "12 flavors. Select one to explore.",
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
    {
      name: "Apple Caramel Pop",
      description:
        "Crisp apple layered with smooth caramel sweetness for a rich, candy-inspired finish.",
      notes: ["Apple", "Caramel", "Sweet"],
    },
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
