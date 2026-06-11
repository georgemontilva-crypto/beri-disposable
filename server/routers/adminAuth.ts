import { ADMIN_COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  beriCookieOptions,
  hashPassword,
  signBeriSession,
  verifyPassword,
} from "../auth";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";

export const adminAuthRouter = beriRouter({
  /** Returns whether the system already has at least one admin (for first-run setup). */
  setupStatus: beriPublicProcedure.query(async () => {
    const count = await db.countAdmins();
    return { needsSetup: count === 0 };
  }),

  /** Create the very first admin. Only allowed when no admin exists yet. */
  setup: beriPublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const count = await db.countAdmins();
      if (count > 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin already configured" });
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
});
