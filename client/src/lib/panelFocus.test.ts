import { describe, expect, it } from "vitest";

/**
 * Mirrors how ProductPanels picks the open card on a phone: the one covering
 * most of the strip, not whichever observer entry fired last.
 */
function focused(ratios: Record<string, number>, threshold = 0.55): string | null {
  let best: string | null = null;
  let bestRatio = 0;
  for (const [key, r] of Object.entries(ratios)) {
    if (r > bestRatio) {
      bestRatio = r;
      best = key;
    }
  }
  return bestRatio > threshold ? best : null;
}

describe("panel focus on a phone", () => {
  it("picks the card covering most of the strip", () => {
    expect(focused({ crush: 0.9, cliq: 0.2 })).toBe("crush");
  });

  it("ignores callback order and compares the ratios", () => {
    // Two cards intersect at once mid-swipe; the later entry is often the one
    // leaving the screen, so reacting to it would open the wrong card.
    expect(focused({ crush: 0.85, cliq: 0.3, cirql: 0.05 })).toBe("crush");
  });

  it("opens nothing while the swipe sits between two cards", () => {
    expect(focused({ crush: 0.5, cliq: 0.5 })).toBeNull();
  });

  it("opens nothing when the strip is off screen", () => {
    expect(focused({ crush: 0, cliq: 0 })).toBeNull();
  });
});
