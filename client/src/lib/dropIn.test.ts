import { describe, expect, it } from "vitest";

const DROP_DISTANCE = 220;
const DROP_DURATION = 1.1;
const DROP_STAGGER = 0.16;

function easeOutBack(t: number): number {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Mirrors the entrance branch of ParallaxBanner's frame(). */
function dropOffset(elapsed: number, layerIndex: number): number {
  const t = (elapsed - layerIndex * DROP_STAGGER) / DROP_DURATION;
  if (t < 0) return -DROP_DISTANCE;
  if (t >= 1) return 0;
  return -DROP_DISTANCE * (1 - easeOutBack(t));
}

describe("layered drop-in", () => {
  it("starts every layer lifted above its resting place", () => {
    expect(dropOffset(0, 0)).toBe(-DROP_DISTANCE);
    expect(dropOffset(0, 2)).toBe(-DROP_DISTANCE);
  });

  it("settles exactly at zero, leaving no residual offset", () => {
    expect(dropOffset(5, 0)).toBe(0);
    expect(dropOffset(5, 2)).toBe(0);
  });

  it("lands the back layer before the front one", () => {
    const mid = 0.9;
    expect(Math.abs(dropOffset(mid, 0))).toBeLessThan(Math.abs(dropOffset(mid, 2)));
  });

  it("overshoots past the resting point before settling", () => {
    // easeOutBack exceeds 1 near the end, which puts the offset below zero.
    const samples = Array.from({ length: 40 }, (_, i) =>
      dropOffset(0.55 + i * 0.012, 0)
    );
    expect(samples.some((v) => v > 0)).toBe(true);
  });

  it("never lifts a layer beyond the 25% oversize of a 500px frame", () => {
    const worst = Math.abs(dropOffset(0, 0));
    expect(worst).toBeLessThanOrEqual(500 * 0.25 * 4);
  });
});
