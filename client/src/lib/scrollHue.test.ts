import { describe, expect, it } from "vitest";

/** Mirrors the mapping in ScrollHue: scroll position -> hue in degrees. */
function hueForScroll(scrollY: number, scrollHeight: number, viewport: number): number {
  const max = scrollHeight - viewport;
  const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  return Math.round(progress * 360);
}

describe("scroll hue mapping", () => {
  it("starts at 0 at the top of the page", () => {
    expect(hueForScroll(0, 4000, 800)).toBe(0);
  });

  it("completes a full turn at the bottom, so top and bottom match", () => {
    expect(hueForScroll(3200, 4000, 800)).toBe(360);
  });

  it("is halfway round at the midpoint", () => {
    expect(hueForScroll(1600, 4000, 800)).toBe(180);
  });

  it("clamps past the end instead of running past 360", () => {
    expect(hueForScroll(99999, 4000, 800)).toBe(360);
  });

  it("returns 0 when the page is too short to scroll (no divide by zero)", () => {
    expect(hueForScroll(0, 600, 800)).toBe(0);
  });
})
