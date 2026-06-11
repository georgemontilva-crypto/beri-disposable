import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./_core/context";
import { getAdminSessionToken, getWholesaleSessionToken, verifyBeriSession } from "./auth";
import * as db from "./db";

/**
 * A separate tRPC instance that resolves the proprietary admin/wholesale sessions
 * from their dedicated cookies (independent of Manus OAuth `ctx.user`).
 */
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

export const beriRouter = t.router;
export const beriPublicProcedure = t.procedure;

export const adminAuthedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const token = getAdminSessionToken(ctx.req);
  const session = await verifyBeriSession(token, "admin");
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin authentication required" });
  }
  const admin = await db.getAdminById(session.sub);
  if (!admin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin not found" });
  }
  return next({ ctx: { ...ctx, admin } });
});

export const wholesaleAuthedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const token = getWholesaleSessionToken(ctx.req);
  const session = await verifyBeriSession(token, "wholesale");
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Wholesale authentication required" });
  }
  const wsUser = await db.getWholesaleUserById(session.sub);
  if (!wsUser || wsUser.status !== "active") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not active" });
  }
  return next({ ctx: { ...ctx, wsUser } });
});
