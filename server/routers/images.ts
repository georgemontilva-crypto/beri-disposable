import { z } from "zod";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";
import { storagePut } from "../storage";

export const imagesRouter = beriRouter({
  /** PUBLIC: returns slot -> url map so the frontend can render managed images. */
  publicMap: beriPublicProcedure.query(async () => {
    return db.getPublicImageMap();
  }),

  /* ----------------------------- Admin ----------------------------- */

  adminList: adminAuthedProcedure.query(async () => {
    return db.listSiteImages();
  }),

  /**
   * Admin upload. Accepts a base64 data string. The file is stored in object
   * storage (Manus storage in dev; configure R2 at deploy time — see DEPLOY.md)
   * and a DB record links it to a logical slot/section of the site.
   */
  adminUpload: adminAuthedProcedure
    .input(
      z.object({
        slot: z.string().min(1).max(128),
        section: z.string().max(128).optional(),
        title: z.string().max(255).optional(),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        base64: z.string().min(1),
        width: z.number().int().optional(),
        height: z.number().int().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `site-images/${input.slot}/${safeName}`;
      const { key: storageKey, url } = await storagePut(key, buffer, input.mimeType);
      const saved = await db.upsertSiteImage({
        slot: input.slot,
        section: input.section ?? null,
        title: input.title ?? null,
        storageKey,
        url,
        width: input.width ?? null,
        height: input.height ?? null,
        sizeBytes: buffer.length,
        mimeType: input.mimeType,
      });
      return { success: true, image: saved };
    }),

  adminDelete: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.deleteSiteImage(input.id);
      return { success: true };
    }),

  adminStats: adminAuthedProcedure.query(async () => {
    return db.getDashboardStats();
  }),
});
