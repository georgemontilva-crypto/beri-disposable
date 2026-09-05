import { describe, expect, it } from "vitest";

const REMEMBER_MS = 1000 * 60 * 60 * 24 * 30;

/** Mirrors alreadyVerified() in AgeGate. */
function alreadyVerified(raw: string | null, now = Date.now()): boolean {
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at)) return false;
  const age = now - at;
  return age >= 0 && age < REMEMBER_MS;
}

describe("age gate memory", () => {
  const now = 1_700_000_000_000;

  it("asks on a first visit", () => {
    expect(alreadyVerified(null, now)).toBe(false);
  });

  it("stays unlocked within the remembered window", () => {
    expect(alreadyVerified(String(now - 1000), now)).toBe(true);
  });

  it("asks again once the window has passed", () => {
    expect(alreadyVerified(String(now - REMEMBER_MS - 1), now)).toBe(false);
  });

  it("asks again on a hand-edited value instead of unlocking", () => {
    // The value lives in localStorage, so anyone can change it. Falling back to
    // asking is the safe direction for a legal gate.
    expect(alreadyVerified("yes", now)).toBe(false);
    expect(alreadyVerified("", now)).toBe(false);
  });

  it("asks again on a timestamp from the future", () => {
    // Without the lower bound a far-future date reads as 'inside the window'
    // and holds the gate open indefinitely.
    expect(alreadyVerified(String(now + REMEMBER_MS * 2), now)).toBe(false);
  });
});
