import { describe, expect, it } from "vitest";

/** Mirrors the progress calculation in ParallaxBanner. */
function progress(rectTop: number, rectHeight: number, viewport: number): number {
  return (
    (rectTop + rectHeight / 2 - viewport / 2) / (viewport / 2 + rectHeight / 2)
  );
}

/** Pixel offset applied to a layer. */
const offset = (p: number, speed: number) => p * speed * 100;

describe("parallax progress", () => {
  const VIEWPORT = 900;
  const HEIGHT = 500;

  it("is zero when the section is centred in the viewport", () => {
    const top = VIEWPORT / 2 - HEIGHT / 2;
    expect(progress(top, HEIGHT, VIEWPORT)).toBeCloseTo(0, 5);
  });

  it("is positive while the section is still below the fold", () => {
    expect(progress(VIEWPORT, HEIGHT, VIEWPORT)).toBeGreaterThan(0);
  });

  it("is negative once the section has scrolled above the middle", () => {
    expect(progress(-HEIGHT, HEIGHT, VIEWPORT)).toBeLessThan(0);
  });

  it("reaches about 1 and -1 at the extremes, so travel stays bounded", () => {
    expect(progress(VIEWPORT, HEIGHT, VIEWPORT)).toBeCloseTo(1, 5);
    expect(progress(-HEIGHT, HEIGHT, VIEWPORT)).toBeCloseTo(-1, 5);
  });

  it("moves the front layer further than the back one — the whole point", () => {
    const p = progress(VIEWPORT, HEIGHT, VIEWPORT);
    expect(Math.abs(offset(p, 0.9))).toBeGreaterThan(Math.abs(offset(p, 0.15)));
  });

  it("keeps every layer inside the 25% oversize, so no edges show", () => {
    const p = progress(VIEWPORT, HEIGHT, VIEWPORT);
    const maxTravel = Math.abs(offset(p, 0.9));
    // At 18% the two were exactly equal and the edge grazed the frame.
    expect(maxTravel).toBeLessThan(HEIGHT * 0.25);
  });
});
