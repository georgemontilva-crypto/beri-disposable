import { describe, expect, it } from "vitest";
import {
  hashPassword,
  signBeriSession,
  verifyBeriSession,
  verifyPassword,
} from "./auth";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("super-secret-123");
    expect(hash).not.toBe("super-secret-123");
    expect(await verifyPassword("super-secret-123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("beri sessions", () => {
  it("signs and verifies an admin session", async () => {
    const token = await signBeriSession({ sub: 7, kind: "admin", email: "admin@beri.com" });
    const session = await verifyBeriSession(token, "admin");
    expect(session).not.toBeNull();
    expect(session?.sub).toBe(7);
    expect(session?.kind).toBe("admin");
    expect(session?.email).toBe("admin@beri.com");
  });

  it("rejects a token for the wrong kind", async () => {
    const token = await signBeriSession({ sub: 1, kind: "wholesale", email: "w@beri.com" });
    const asAdmin = await verifyBeriSession(token, "admin");
    expect(asAdmin).toBeNull();
  });

  it("rejects an invalid token", async () => {
    expect(await verifyBeriSession("not-a-jwt", "admin")).toBeNull();
    expect(await verifyBeriSession(undefined, "wholesale")).toBeNull();
  });
});
