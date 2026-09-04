import { describe, expect, it } from "vitest";

/** Mirrors the fragment logic in ProductPanels' PanelVideo. */
const posterFrameUrl = (url: string) => (url.includes("#") ? url : `${url}#t=0.1`);

describe("first-frame fragment", () => {
  it("adds a time offset so iOS decodes and shows a frame", () => {
    expect(posterFrameUrl("https://cdn/x.mp4")).toBe("https://cdn/x.mp4#t=0.1");
  });

  it("leaves a URL that already has a fragment alone", () => {
    expect(posterFrameUrl("https://cdn/x.mp4#t=2")).toBe("https://cdn/x.mp4#t=2");
  });

  it("keeps query strings intact", () => {
    // R2 public URLs are plain, but a signed one would carry a query.
    expect(posterFrameUrl("https://cdn/x.mp4?v=3")).toBe("https://cdn/x.mp4?v=3#t=0.1");
  });
});
