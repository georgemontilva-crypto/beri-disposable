import { describe, expect, it } from "vitest";

/**
 * Mirror of the token-parsing logic used by codes.adminBulkImport.
 * Kept in sync intentionally to lock down the parsing behavior.
 */
function parseCodeTokens(content: string): string[] {
  return content
    .split(/[\r\n,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !/^(id|code|created|updated)$/i.test(t));
}

describe("code CSV/TXT parsing", () => {
  it("parses newline separated codes", () => {
    const tokens = parseCodeTokens("708839800535\n708875264907\n708881078659");
    expect(tokens).toEqual(["708839800535", "708875264907", "708881078659"]);
  });

  it("parses comma separated codes and strips header tokens", () => {
    const tokens = parseCodeTokens("code,created\n708839800535,2026-04-23\n708875264907,2026-04-23");
    expect(tokens).toContain("708839800535");
    expect(tokens).toContain("708875264907");
    expect(tokens).not.toContain("code");
    expect(tokens).not.toContain("created");
  });

  it("ignores empty lines and whitespace", () => {
    const tokens = parseCodeTokens("  708839800535  \n\n   \n708875264907\n");
    expect(tokens).toEqual(["708839800535", "708875264907"]);
  });
});

function buildCsv(rows: Array<Record<string, unknown>>): string {
  const header = ["ID", "Name", "Email"];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.id, r.name, r.email].map(escape).join(","));
  }
  return lines.join("\n");
}

describe("CSV export escaping", () => {
  it("escapes commas and quotes", () => {
    const csv = buildCsv([{ id: 1, name: 'Doe, John "JD"', email: "jd@x.com" }]);
    expect(csv).toContain('"Doe, John ""JD"""');
  });
});
