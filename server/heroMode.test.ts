import { describe, expect, it } from "vitest";

/** Mirrors the hero selection in HeroFan. */
function usesLayers(mode: string, hasLayers: boolean): boolean {
  return mode === "layers" || (mode === "auto" && hasLayers);
}

describe("hero mode selection", () => {
  it("auto falls back to the video when no layer is uploaded", () => {
    expect(usesLayers("auto", false)).toBe(false);
  });

  it("auto switches to layers as soon as one is uploaded", () => {
    expect(usesLayers("auto", true)).toBe(true);
  });

  it("video stays on the video even with layers uploaded", () => {
    expect(usesLayers("video", true)).toBe(false);
  });

  it("layers wins even before any layer is uploaded, so the slots show through", () => {
    expect(usesLayers("layers", false)).toBe(true);
  });
});
