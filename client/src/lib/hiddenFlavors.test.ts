import { describe, expect, it } from "vitest";
import { BERI_CLIQ, PRODUCTS } from "./products";

/** The 15 kits catalogued but switched off while the range is prepared. */
const HIDDEN_KITS = [
  "Alaskan Mint",
  "Banana Ice",
  "Black Razz Ice",
  "Blue Coconut",
  "Blue Rancher",
  "Green Apple",
  "Mango Bomb",
  "Mixed Berry",
  "Passion Fruit Mango",
  "Peach Refresher",
  "Punch Ice",
  "Sour Neon FAB",
  "Sour Watermelon Gami",
  "Strawberry Burst",
  "Watermelon BG",
];

const kits = BERI_CLIQ.flavors.filter((f) => f.edition === "Kits");
// Pods are Cliq's base range, so they carry no `edition`.
const pods = BERI_CLIQ.flavors.filter((f) => !f.edition);

describe("hidden flavours", () => {
  it("keeps all 25 kits in the catalogue", () => {
    expect(kits).toHaveLength(25);
  });

  it("hides exactly the fifteen new kits", () => {
    expect(kits.filter((f) => f.hidden).map((f) => f.name).sort()).toEqual(
      [...HIDDEN_KITS].sort()
    );
  });

  it("leaves ten kits on the site", () => {
    expect(kits.filter((f) => !f.hidden)).toHaveLength(10);
  });

  it("does not hide anything in Pods", () => {
    expect(pods.filter((f) => f.hidden)).toEqual([]);
    expect(pods).toHaveLength(25);
  });

  it("hides nothing in the other products", () => {
    for (const p of PRODUCTS) {
      if (p.key === "cliq") continue;
      expect(p.flavors.filter((f) => f.hidden)).toEqual([]);
    }
  });

  it("keeps every slot unique, hidden ones included", () => {
    const slots = PRODUCTS.flatMap((p) => p.flavors.map((f) => f.slot));
    expect(new Set(slots).size).toBe(slots.length);
  });
});
