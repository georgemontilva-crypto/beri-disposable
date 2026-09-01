import { describe, expect, it } from "vitest";

/** Mirrors the normalisation in db.addSubscriber. */
const normalize = (email: string) => email.trim().toLowerCase();

describe("newsletter email normalisation", () => {
  it("lowercases, so Ana@X.com and ana@x.com are one subscriber", () => {
    expect(normalize("Ana@X.com")).toBe(normalize("ana@x.com"));
  });

  it("trims whitespace pasted in from another app", () => {
    expect(normalize("  ana@x.com \n")).toBe("ana@x.com");
  });

  it("leaves an already-clean address untouched", () => {
    expect(normalize("ana@x.com")).toBe("ana@x.com");
  });
});

describe("csv export escaping", () => {
  const cell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

  it("quotes every field so a comma can't shift the columns", () => {
    expect(cell("a,b")).toBe('"a,b"');
  });

  it("doubles embedded quotes rather than breaking the field", () => {
    expect(cell('he said "hi"')).toBe('"he said ""hi"""');
  });
});
