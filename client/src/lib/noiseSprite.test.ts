import { describe, expect, it } from "vitest";
import { fbm } from "./noiseSprite";

/**
 * Mirrors the density calculation inside makeNoiseSprite. Tested here rather
 * than through the canvas because jsdom has no 2D context.
 */
function density(x: number, y: number, seed: number, size = 192, scale = 3.2) {
  const n = fbm((x / size) * scale, (y / size) * scale, seed);
  const half = size / 2;
  const dx = (x - half) / half;
  const dy = (y - half) / half;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const falloff = dist >= 1 ? 0 : Math.pow(1 - dist, 2.1);
  return Math.max(0, n * 1.9 - 0.5) * falloff;
}

describe("noise sprite", () => {
  it("is deterministic, so a sprite looks the same every mount", () => {
    expect(fbm(0.4, 0.7, 13)).toBe(fbm(0.4, 0.7, 13));
  });

  it("gives different shapes for different seeds", () => {
    expect(fbm(0.4, 0.7, 13)).not.toBe(fbm(0.4, 0.7, 99));
  });

  it("stays within 0..1 so the alpha never clips oddly", () => {
    for (let i = 0; i < 200; i++) {
      const v = fbm(Math.random() * 8, Math.random() * 8, 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("is fully transparent outside the radius", () => {
    expect(density(0, 0, 13)).toBe(0);
    expect(density(191, 191, 13)).toBe(0);
  });

  it("carves holes in the outline instead of only dimming it", () => {
    // Sampled around a ring: some points must be completely empty, or the
    // silhouette stays a disc and reads as a circle however it moves.
    const samples: number[] = [];
    for (let a = 0; a < 64; a++) {
      const angle = (a / 64) * Math.PI * 2;
      const x = Math.round(96 + Math.cos(angle) * 0.55 * 96);
      const y = Math.round(96 + Math.sin(angle) * 0.55 * 96);
      samples.push(density(x, y, 13));
    }
    expect(samples.filter((v) => v === 0).length).toBeGreaterThan(0);
    expect(Math.max(...samples)).toBeGreaterThan(0);
  });
});
