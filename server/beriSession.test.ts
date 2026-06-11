import { describe, expect, it } from "vitest";
import {
  signBeriSession,
  verifyBeriSession,
  hashPassword,
  verifyPassword,
} from "./auth";

describe("beri sessions", () => {
  it("signs and verifies an admin session", async () => {
    const token = await signBeriSession({ sub: 7, kind: "admin", email: "a@b.com" });
    const payload = await verifyBeriSession(token, "admin");
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe(7);
    expect(payload?.kind).toBe("admin");
    expect(payload?.email).toBe("a@b.com");
  });

  it("rejects a session verified against the wrong kind", async () => {
    const token = await signBeriSession({ sub: 1, kind: "admin", email: "a@b.com" });
    const payload = await verifyBeriSession(token, "wholesale");
    expect(payload).toBeNull();
  });

  it("returns null for missing or malformed tokens", async () => {
    expect(await verifyBeriSession(undefined, "admin")).toBeNull();
    expect(await verifyBeriSession("not-a-jwt", "admin")).toBeNull();
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("super-secret-123");
    expect(hash).not.toBe("super-secret-123");
    expect(await verifyPassword("super-secret-123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
