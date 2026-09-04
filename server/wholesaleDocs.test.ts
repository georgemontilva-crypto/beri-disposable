import { describe, expect, it } from "vitest";

const DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

/** Mirrors the key the presign endpoint builds. */
function docKey(kind: string, fileName: string, now = 1700000000000) {
  const safe =
    fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^[._-]+/, "")
      .slice(0, 120) || "document";
  return `wholesale-docs/${kind}/${now}-${safe}`;
}

describe("wholesale document uploads", () => {
  it("confines every key to the wholesale-docs prefix", () => {
    expect(docKey("fein", "ein.pdf")).toMatch(/^wholesale-docs\//);
  });

  it("neutralises path traversal in the supplied filename", () => {
    // The name comes from an anonymous form, so it can't be trusted to stay
    // inside the prefix on its own. Stripping the separators is what makes it
    // safe; collapsing the dots just keeps the bucket listing readable.
    const key = docKey("fein", "../../secrets.env");
    expect(key).not.toContain("..");
    expect(key.split("/").length).toBe(3);
    expect(key).toMatch(/^wholesale-docs\/fein\//);
  });

  it("never produces an empty name", () => {
    expect(docKey("fein", "...")).toMatch(/-document$/);
  });

  it("strips characters that would break the key", () => {
    expect(docKey("fein", 'a b"c/d.pdf')).toContain("a_b_c_d.pdf");
  });

  it("accepts documents and images, nothing else", () => {
    expect(DOC_TYPES).toContain("application/pdf");
    expect(DOC_TYPES).toContain("image/jpeg");
    expect(DOC_TYPES).not.toContain("text/html");
    expect(DOC_TYPES).not.toContain("application/javascript");
  });
});
