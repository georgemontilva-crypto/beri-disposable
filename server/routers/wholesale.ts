import { WHOLESALE_COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import {
  beriCookieOptions,
  hashPassword,
  signBeriSession,
  verifyPassword,
} from "../auth";
import {
  adminAuthedProcedure,
  beriPublicProcedure,
  beriRouter,
} from "../beriTrpc";
import * as db from "../db";
import { buildApprovalEmail, sendEmail } from "../email";
import { notifyOwner } from "../_core/notification";

const REG_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const wholesaleRouter = beriRouter({
  /** PUBLIC: submit a wholesale inquiry from the public form. */
  submitInquiry: beriPublicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        company: z.string().max(255).optional(),
        email: z.string().email(),
        phone: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createInquiry({
        name: input.name.trim(),
        company: input.company?.trim() || null,
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        status: "pending",
      });
      // Notify the project owner (best-effort).
      try {
        await notifyOwner({
          title: "New Beri Wholesale Inquiry",
          content: `${input.name} (${input.company ?? "—"}) — ${input.email} ${input.phone ?? ""}`,
        });
      } catch {
        /* best-effort */
      }
      return { success: true };
    }),

  /* ----------------------------- Admin: inquiries ----------------------------- */

  adminListInquiries: adminAuthedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const { rows, total } = await db.listInquiries({
        search: input.search?.trim() || undefined,
        status: input.status,
        limit: input.pageSize,
        offset,
      });
      return { rows, total, page: input.page, pageSize: input.pageSize };
    }),

  /** Approve an inquiry: creates a pending wholesale user + emails a registration link. */
  adminApproveInquiry: adminAuthedProcedure
    .input(z.object({ id: z.number().int(), origin: z.string().url() }))
    .mutation(async ({ input }) => {
      const inquiry = await db.getInquiryById(input.id);
      if (!inquiry) throw new TRPCError({ code: "NOT_FOUND", message: "Inquiry not found" });

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + REG_TOKEN_TTL_MS);

      const existing = await db.getWholesaleUserByEmail(inquiry.email);
      if (existing) {
        await db.updateWholesaleUser(existing.id, {
          status: "approved",
          registrationToken: token,
          registrationTokenExpiresAt: expiresAt,
          name: inquiry.name,
          company: inquiry.company,
          phone: inquiry.phone,
        });
      } else {
        await db.createWholesaleUser({
          email: inquiry.email,
          name: inquiry.name,
          company: inquiry.company,
          phone: inquiry.phone,
          status: "approved",
          registrationToken: token,
          registrationTokenExpiresAt: expiresAt,
        });
      }

      await db.updateInquiryStatus(input.id, "approved");

      const registrationUrl = `${input.origin}/wholesale/complete?token=${token}`;
      const { subject, html, text } = buildApprovalEmail({ name: inquiry.name, registrationUrl });
      const emailResult = await sendEmail({ to: inquiry.email, subject, html, text });

      return { success: true, emailSent: emailResult.ok, provider: emailResult.provider, registrationUrl };
    }),

  adminRejectInquiry: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.updateInquiryStatus(input.id, "rejected");
      return { success: true };
    }),

  adminExportInquiries: adminAuthedProcedure.query(async () => {
    const rows = await db.listAllInquiriesForExport();
    const header = ["ID", "Name", "Company", "Email", "Phone", "Status", "Created"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [r.id, r.name, r.company ?? "", r.email, r.phone ?? "", r.status, r.createdAt?.toISOString() ?? ""]
          .map(escape)
          .join(",")
      );
    }
    return { csv: lines.join("\n") };
  }),

  /* ----------------------------- Admin: wholesale users ----------------------------- */

  adminListUsers: adminAuthedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const { rows, total } = await db.listWholesaleUsers({
        search: input.search?.trim() || undefined,
        limit: input.pageSize,
        offset,
      });
      // Never expose password hashes / tokens
      const safe = rows.map(({ passwordHash, registrationToken, ...rest }) => rest);
      return { rows: safe, total, page: input.page, pageSize: input.pageSize };
    }),

  /* ----------------------------- Wholesale registration completion & auth ----------------------------- */

  /** PUBLIC: validate a registration token (for the complete-registration page). */
  validateRegistrationToken: beriPublicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const user = await db.getWholesaleUserByToken(input.token);
      if (!user || user.status !== "approved") return { valid: false as const };
      if (user.registrationTokenExpiresAt && user.registrationTokenExpiresAt.getTime() < Date.now()) {
        return { valid: false as const };
      }
      return { valid: true as const, email: user.email, name: user.name };
    }),

  /** PUBLIC: complete registration by setting a password. Activates the account + logs in. */
  completeRegistration: beriPublicProcedure
    .input(z.object({ token: z.string().min(1), password: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getWholesaleUserByToken(input.token);
      if (!user || user.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or used token" });
      }
      if (user.registrationTokenExpiresAt && user.registrationTokenExpiresAt.getTime() < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token expired" });
      }
      const passwordHash = await hashPassword(input.password);
      await db.updateWholesaleUser(user.id, {
        passwordHash,
        status: "active",
        registrationToken: null,
        registrationTokenExpiresAt: null,
        lastSignedIn: new Date(),
      });
      const token = await signBeriSession({ sub: user.id, kind: "wholesale", email: user.email });
      ctx.res.cookie(WHOLESALE_COOKIE_NAME, token, beriCookieOptions(ctx.req));
      return { success: true };
    }),

  /** PUBLIC: wholesale customer login. */
  login: beriPublicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getWholesaleUserByEmail(input.email.toLowerCase());
      if (!user || !user.passwordHash || user.status !== "active") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials or inactive account" });
      }
      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      await db.updateWholesaleUser(user.id, { lastSignedIn: new Date() });
      const token = await signBeriSession({ sub: user.id, kind: "wholesale", email: user.email });
      ctx.res.cookie(WHOLESALE_COOKIE_NAME, token, beriCookieOptions(ctx.req));
      return { success: true, user: { email: user.email, name: user.name, company: user.company } };
    }),

  me: beriPublicProcedure.query(async ({ ctx }) => {
    const { getWholesaleSessionToken, verifyBeriSession } = await import("../auth");
    const token = getWholesaleSessionToken(ctx.req);
    const session = await verifyBeriSession(token, "wholesale");
    if (!session) return null;
    const user = await db.getWholesaleUserById(session.sub);
    if (!user || user.status !== "active") return null;
    return { id: user.id, email: user.email, name: user.name, company: user.company };
  }),

  logout: beriPublicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(WHOLESALE_COOKIE_NAME, { ...beriCookieOptions(ctx.req), maxAge: -1 });
    return { success: true };
  }),
});
