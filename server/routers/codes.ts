import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";

function clientIp(req: any): string | null {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? null;
}

export const codesRouter = beriRouter({
  /** PUBLIC: verify an authentication code typed by a customer. Logs every attempt. */
  verify: beriPublicProcedure
    .input(z.object({ code: z.string().min(1).max(128) }))
    .mutation(async ({ input, ctx }) => {
      const code = input.code.trim();
      const found = await db.findAuthCode(code);
      const result: "valid" | "not_found" = found ? "valid" : "not_found";
      await db.insertQueryLog({
        code,
        result,
        ip: clientIp(ctx.req),
        userAgent: (ctx.req.headers["user-agent"] as string) ?? null,
      });
      return { valid: result === "valid", code };
    }),

  /* ----------------------------- Admin: codes management ----------------------------- */

  adminList: adminAuthedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const { rows, total } = await db.listAuthCodes({
        search: input.search?.trim() || undefined,
        limit: input.pageSize,
        offset,
      });
      return { rows, total, page: input.page, pageSize: input.pageSize };
    }),

  adminAdd: adminAuthedProcedure
    .input(z.object({ code: z.string().min(1).max(128) }))
    .mutation(async ({ input }) => {
      await db.addAuthCode(input.code.trim());
      return { success: true };
    }),

  adminBulkImport: adminAuthedProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // Accept CSV or TXT: split on newlines and commas, strip header-ish tokens.
      const tokens = input.content
        .split(/[\r\n,;]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && !/^(id|code|created|updated)$/i.test(t));
      if (tokens.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No codes found in file" });
      }
      const { processed } = await db.bulkInsertAuthCodes(tokens);
      return { success: true, processed };
    }),

  adminDelete: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.deleteAuthCode(input.id);
      return { success: true };
    }),

  /* ----------------------------- Admin: query logs ----------------------------- */

  adminLogs: adminAuthedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const { rows, total } = await db.listQueryLogs({
        search: input.search?.trim() || undefined,
        limit: input.pageSize,
        offset,
      });
      return { rows, total, page: input.page, pageSize: input.pageSize };
    }),
});
