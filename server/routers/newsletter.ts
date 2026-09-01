import { z } from "zod";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";

export const newsletterRouter = beriRouter({
  /**
   * PUBLIC. Always reports success, whether the address was new or already on
   * the list: a distinct "you're already subscribed" response would let anyone
   * test whether a given address is a subscriber.
   */
  subscribe: beriPublicProcedure
    .input(
      z.object({
        email: z.string().email().max(255),
        source: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.addSubscriber(input.email, input.source ?? "home");
      return { success: true };
    }),

  adminList: adminAuthedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(500).default(200) }).optional())
    .query(async ({ input }) => {
      const [rows, total] = await Promise.all([
        db.listSubscribers(input?.limit ?? 200),
        db.countSubscribers(),
      ]);
      return { rows, total };
    }),
});
