import { describe, expect, it } from "vitest";

/**
 * Mirrors FlavorCarousel's step(): how far one advance scrolls, and when the
 * strip wraps back to the start.
 */
function nextScrollLeft(p: {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
  itemWidth: number;
  gap: number;
  direction: 1 | -1;
}): number {
  const amount = p.itemWidth + p.gap;
  const atEnd = p.scrollLeft + p.clientWidth >= p.scrollWidth - 4;
  if (p.direction === 1 && atEnd) return 0;
  return p.scrollLeft + amount * p.direction;
}

const base = {
  clientWidth: 1000,
  scrollWidth: 3000,
  itemWidth: 235,
  gap: 20,
};

describe("carousel stepping", () => {
  it("advances by exactly one item plus the gap", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 0, direction: 1 })).toBe(255);
  });

  it("steps back by the same amount", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 255, direction: -1 })).toBe(0);
  });

  it("wraps to the start once the end is reached", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 2000, direction: 1 })).toBe(0);
  });

  it("tolerates sub-pixel rounding at the end rather than sticking", () => {
    // Browsers report fractional scroll positions; without the 4px slack the
    // end would never compare as reached and the strip would stop advancing.
    expect(nextScrollLeft({ ...base, scrollLeft: 1997.5, direction: 1 })).toBe(0);
  });

  it("does not wrap when going backwards from the end", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 2000, direction: -1 })).toBe(1745);
  });
});
