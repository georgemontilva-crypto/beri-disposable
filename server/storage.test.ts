import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const R2_VARS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

const original: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of R2_VARS) {
    original[k] = process.env[k];
    delete process.env[k];
  }
  vi.resetModules();
});

afterEach(() => {
  for (const k of R2_VARS) {
    if (original[k] === undefined) delete process.env[k];
    else process.env[k] = original[k];
  }
});

describe("storage configuration", () => {
  it("reports every missing variable when nothing is set", async () => {
    const { isStorageConfigured, missingStorageVars } = await import("./storage");
    expect(isStorageConfigured()).toBe(false);
    expect(missingStorageVars()).toEqual([...R2_VARS]);
  });

  it("reports only the variables that are still missing", async () => {
    process.env.R2_ACCOUNT_ID = "acct";
    process.env.R2_BUCKET = "beri-media";
    const { isStorageConfigured, missingStorageVars } = await import("./storage");
    expect(isStorageConfigured()).toBe(false);
    expect(missingStorageVars()).toEqual([
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_PUBLIC_URL",
    ]);
  });

  it("is configured once all variables are present", async () => {
    for (const k of R2_VARS) process.env[k] = "x";
    const { isStorageConfigured, missingStorageVars } = await import("./storage");
    expect(isStorageConfigured()).toBe(true);
    expect(missingStorageVars()).toEqual([]);
  });

  it("builds public URLs without a double slash", async () => {
    for (const k of R2_VARS) process.env[k] = "x";
    process.env.R2_PUBLIC_URL = "https://media.beri.com/";
    const { publicUrlFor } = await import("./storage");
    expect(publicUrlFor("site-media/crush_hero/a.png")).toBe(
      "https://media.beri.com/site-media/crush_hero/a.png"
    );
    expect(publicUrlFor("/leading-slash.png")).toBe(
      "https://media.beri.com/leading-slash.png"
    );
  });
});
