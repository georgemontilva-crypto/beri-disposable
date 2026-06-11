import { ADMIN_COOKIE_NAME, THIRTY_DAYS_MS, WHOLESALE_COOKIE_NAME } from "@shared/const";
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

/**
 * Proprietary authentication helpers (NOT Manus OAuth).
 * Used for both the admin panel and the wholesale customer portal.
 * Sessions are signed JWTs stored in dedicated cookies.
 */

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function getSecret() {
  // Reuse JWT_SECRET; this is independent of the OAuth flow.
  return new TextEncoder().encode(ENV.cookieSecret || "beri-dev-secret-change-me");
}

export type BeriSessionKind = "admin" | "wholesale";

export type BeriSessionPayload = {
  sub: number; // user id
  kind: BeriSessionKind;
  email: string;
};

export async function signBeriSession(
  payload: BeriSessionPayload,
  expiresInMs: number = THIRTY_DAYS_MS
): Promise<string> {
  const expSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ sub: String(payload.sub), kind: payload.kind, email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expSeconds)
    .sign(getSecret());
}

export async function verifyBeriSession(
  token: string | undefined | null,
  expectedKind: BeriSessionKind
): Promise<BeriSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const sub = Number(payload.sub);
    const kind = payload.kind as BeriSessionKind;
    const email = payload.email as string;
    if (!Number.isFinite(sub) || kind !== expectedKind || !email) return null;
    return { sub, kind, email };
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const parsed = parseCookieHeader(req.headers.cookie ?? "");
  return parsed[name];
}

export function getAdminSessionToken(req: Request): string | undefined {
  return readCookie(req, ADMIN_COOKIE_NAME);
}

export function getWholesaleSessionToken(req: Request): string | undefined {
  return readCookie(req, WHOLESALE_COOKIE_NAME);
}

/** Cookie options consistent with the rest of the app (cross-site safe). */
export function beriCookieOptions(req: Request) {
  const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0];
  const proto = forwardedProto || req.protocol;
  const secure = proto === "https";
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none" as const,
    secure,
    maxAge: THIRTY_DAYS_MS,
  };
}
