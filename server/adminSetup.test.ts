import { describe, expect, it } from "vitest";
import { timingSafeEqual } from "node:crypto";

/** Mirrors the safeEqual helper in routers/adminAuth.ts */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

describe("admin setup token comparison", () => {
  it("accepts an exact match", () => {
    expect(safeEqual("s3cr3t-token", "s3cr3t-token")).toBe(true);
  });

  it("rejects a wrong token of the same length", () => {
    expect(safeEqual("s3cr3t-token", "s3cr3t-tokeX")).toBe(false);
  });

  it("rejects tokens of different length without throwing", () => {
    expect(safeEqual("short", "a-much-longer-token")).toBe(false);
  });

  it("rejects an empty candidate", () => {
    expect(safeEqual("", "real-token")).toBe(false);
  });
});
