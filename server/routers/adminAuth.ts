import { ADMIN_COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  beriCookieOptions,
  hashPassword,
  signBeriSession,
  verifyPassword,
} from "../auth";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";
import { isStorageConfigured, missingStorageVars } from "../storage";

/**
 * Secret required to create the first admin account.
 *
 * Without this, the bootstrap endpoint would let ANY anonymous visitor claim
 * the admin panel as long as the `admin_users` table is still empty. Set
 * `ADMIN_SETUP_TOKEN` in Railway, create the admin, then delete the variable.
 */
const ADMIN_SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN ?? "";

/** Timing-safe string comparison (avoids leaking the token via response time). */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const adminAuthRouter = beriRouter({
  /**
   * Returns whether first-run setup is available.
   *
   * `needsSetup` is true ONLY when there is no admin yet AND the server has an
   * `ADMIN_SETUP_TOKEN` configured, so the setup form is never offered to the
   * public on a deployment that isn't expecting it.
   */
  setupStatus: beriPublicProcedure.query(async () => {
    const count = await db.countAdmins();
    return { needsSetup: count === 0 && ADMIN_SETUP_TOKEN.length > 0 };
  }),

  /** Create the very first admin. Requires the ADMIN_SETUP_TOKEN secret. */
  setup: beriPublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).optional(),
        setupToken: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ADMIN_SETUP_TOKEN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin setup is disabled on this server",
        });
      }
      const count = await db.countAdmins();
      if (count > 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin already configured" });
      }
      if (!safeEqual(input.setupToken, ADMIN_SETUP_TOKEN)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid setup token" });
      }
      const passwordHash = await hashPassword(input.password);
      await db.createAdmin({ email: input.email.toLowerCase(), passwordHash, name: input.name ?? null });
      const admin = await db.getAdminByEmail(input.email.toLowerCase());
      if (!admin) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const token = await signBeriSession({ sub: admin.id, kind: "admin", email: admin.email });
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, beriCookieOptions(ctx.req));
      return { success: true, admin: { id: admin.id, email: admin.email, name: admin.name } };
    }),

  login: beriPublicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const admin = await db.getAdminByEmail(input.email.toLowerCase());
      if (!admin) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      const ok = await verifyPassword(input.password, admin.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      await db.updateAdminLastSignedIn(admin.id);
      const token = await signBeriSession({ sub: admin.id, kind: "admin", email: admin.email });
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, beriCookieOptions(ctx.req));
      return { success: true, admin: { id: admin.id, email: admin.email, name: admin.name } };
    }),

  me: adminAuthedProcedure.query(({ ctx }) => ({
    id: ctx.admin.id,
    email: ctx.admin.email,
    name: ctx.admin.name,
  })),

  logout: beriPublicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...beriCookieOptions(ctx.req), maxAge: -1 });
    return { success: true };
  }),

  /** Aggregate counts for the admin dashboard. */
  dashboardStats: adminAuthedProcedure.query(async () => {
    const stats = await db.getDashboardStats();
    const images = (await db.listSiteImages()).length;
    return {
      codes: stats.totalCodes,
      logs: stats.totalLogs,
      validLogs: stats.validLogs,
      inquiries: stats.totalInquiries,
      pendingInquiries: stats.pendingInquiries,
      users: stats.wholesaleUsers,
      images,
    };
  }),

  /**
   * Everything the dashboard needs in one round trip: counts, health checks,
   * which media slots are filled, and the latest activity.
   */
  dashboardOverview: adminAuthedProcedure.query(async () => {
    const stats = await db.getDashboardStats();
    const siteImages = await db.listSiteImages();
    const recentLogs = await db.listQueryLogs({ limit: 6, offset: 0 });
    const recentInquiries = await db.listInquiries({ limit: 5, offset: 0 });

    // One entry per slot: the newest upload wins, matching the public site.
    const filledSlots = Array.from(new Set(siteImages.map((i) => i.slot)));

    return {
      counts: {
        codes: stats.totalCodes,
        logs: stats.totalLogs,
        validLogs: stats.validLogs,
        inquiries: stats.totalInquiries,
        pendingInquiries: stats.pendingInquiries,
        users: stats.wholesaleUsers,
        images: siteImages.length,
      },
      storage: {
        configured: isStorageConfigured(),
        missing: missingStorageVars(),
      },
      filledSlots,
      recentLogs: recentLogs.rows.map((l) => ({
        id: l.id,
        code: l.code,
        result: l.result,
        createdAt: l.createdAt,
      })),
      recentInquiries: recentInquiries.rows.map((i) => ({
        id: i.id,
        name: i.name,
        company: i.company,
        status: i.status,
        createdAt: i.createdAt,
      })),
    };
  }),
});
