import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";
import {
  isStorageConfigured,
  missingStorageVars,
  storageDelete,
  storagePresignPut,
} from "../storage";

/** Keeps a user-supplied filename safe to use as part of an object key. */
function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export const imagesRouter = beriRouter({
  /** PUBLIC: returns slot -> url map so the frontend can render managed media. */
  publicMap: beriPublicProcedure.query(async () => {
    return db.getPublicImageMap();
  }),

  /* ----------------------------- Admin ----------------------------- */

  adminList: adminAuthedProcedure.query(async () => {
    return db.listSiteImages();
  }),

  /**
   * Reports whether object storage is wired up, so the admin panel can show a
   * clear banner instead of failing on the first upload attempt.
   */
  storageStatus: adminAuthedProcedure.query(() => ({
    configured: isStorageConfigured(),
    missing: missingStorageVars(),
  })),

  /**
   * Step 1 of an upload: hand the browser a presigned PUT URL.
   *
   * The file goes straight from the browser to R2, so neither the request body
   * limit nor the container's memory constrain how large a model or video can
   * be.
   */
  adminPresignUpload: adminAuthedProcedure
    .input(
      z.object({
        slot: z.string().min(1).max(128),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      if (!isStorageConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Storage not configured. Missing: ${missingStorageVars().join(", ")}`,
        });
      }
      const key = `site-media/${input.slot}/${safeFileName(input.fileName)}`;
      const { key: storageKey, uploadUrl, publicUrl } = await storagePresignPut(
        key,
        input.mimeType
      );
      return { storageKey, uploadUrl, publicUrl };
    }),

  /**
   * Step 2 of an upload: record the object in the database once the browser has
   * finished PUTting it to R2.
   */
  adminConfirmUpload: adminAuthedProcedure
    .input(
      z.object({
        slot: z.string().min(1).max(128),
        section: z.string().max(128).optional(),
        title: z.string().max(255).optional(),
        storageKey: z.string().min(1).max(512),
        url: z.string().min(1).max(1024),
        mimeType: z.string().min(1).max(128),
        sizeBytes: z.number().int().nonnegative().optional(),
        width: z.number().int().optional(),
        height: z.number().int().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const saved = await db.upsertSiteImage({
        slot: input.slot,
        section: input.section ?? null,
        title: input.title ?? null,
        storageKey: input.storageKey,
        url: input.url,
        width: input.width ?? null,
        height: input.height ?? null,
        sizeBytes: input.sizeBytes ?? null,
        mimeType: input.mimeType,
      });
      return { success: true, image: saved };
    }),

  adminDelete: adminAuthedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const record = await db.getSiteImageById(input.id);
      // Remove the object first; a failure here shouldn't orphan the DB row, so
      // it is logged rather than thrown.
      if (record?.storageKey && isStorageConfigured()) {
        try {
          await storageDelete(record.storageKey);
        } catch (err) {
          console.warn(`[images] failed to delete ${record.storageKey} from R2:`, err);
        }
      }
      await db.deleteSiteImage(input.id);
      return { success: true };
    }),

  adminStats: adminAuthedProcedure.query(async () => {
    return db.getDashboardStats();
  }),
});
