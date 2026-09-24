import { z } from "zod";
import {
  adminAuthedProcedure,
  beriRouter,
  wholesaleAuthedProcedure,
} from "../beriTrpc";
import * as db from "../db";

/**
 * Partner portal content: brand news and downloadable resources.
 *
 * Reads are behind `wholesaleAuthedProcedure`, not public: pricing sheets and
 * unreleased product photography are exactly what this is for, and an endpoint
 * that anyone could call would publish them to the whole internet regardless of
 * how well the page itself is hidden.
 */
export const partnerRouter = beriRouter({
  news: wholesaleAuthedProcedure.query(async () => db.listPartnerNews(true)),

  resources: wholesaleAuthedProcedure.query(async () => db.listPartnerResources()),

  /* ─── Admin ───────────────────────────────────────────────────────────── */

  adminListNews: adminAuthedProcedure.query(async () => db.listPartnerNews(false)),

  adminCreateNews: adminAuthedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        body: z.string().min(1).max(20000),
        published: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await db.createPartnerNews({
        title: input.title.trim(),
        body: input.body.trim(),
        published: input.published,
      });
      return { success: true };
    }),

  adminSetNewsPublished: adminAuthedProcedure
    .input(z.object({ id: z.number().int(), published: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.updatePartnerNews(input.id, { published: input.published });
      return { success: true };
    }),

  adminDeleteNews: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.deletePartnerNews(input.id);
      return { success: true };
    }),

  adminListResources: adminAuthedProcedure.query(async () =>
    db.listPartnerResources()
  ),

  adminCreateResource: adminAuthedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(512).optional(),
        // Any http(s) link, so Drive, Dropbox or a CDN all work. Validated as a
        // URL so a pasted folder name can't become a dead link on the portal.
        url: z.string().url().max(1024),
        category: z.string().max(64).default("General"),
        sortOrder: z.number().int().min(0).max(999).default(0),
      })
    )
    .mutation(async ({ input }) => {
      await db.createPartnerResource({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        url: input.url.trim(),
        category: input.category.trim() || "General",
        sortOrder: input.sortOrder,
      });
      return { success: true };
    }),

  adminDeleteResource: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.deletePartnerResource(input.id);
      return { success: true };
    }),
});
