import { z } from "zod";
import { adminAuthedProcedure, beriPublicProcedure, beriRouter } from "../beriTrpc";
import * as db from "../db";

/**
 * Site-wide toggles.
 *
 * `defaults` is the source of truth for which keys exist and what they mean —
 * the table only stores overrides, so a fresh database behaves sensibly and
 * adding a switch never needs a migration.
 */
export const SETTING_DEFAULTS = {
  /** Show the four fanned product cards in the homepage hero. */
  home_hero_cards: "true",
  /**
   * What fills the homepage hero.
   *  auto   — parallax layers if any are uploaded, otherwise the video
   *  video  — always the video
   *  layers — always the parallax layers
   * "auto" means uploading a layer is enough to switch, but an explicit choice
   * lets both sets stay uploaded while only one is shown.
   */
  home_hero_mode: "auto",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

function withDefaults(stored: Record<string, string>): Record<string, string> {
  return { ...SETTING_DEFAULTS, ...stored };
}

export const settingsRouter = beriRouter({
  /** PUBLIC: settings the frontend needs to render. */
  publicMap: beriPublicProcedure.query(async () => {
    return withDefaults(await db.getSettings());
  }),

  adminList: adminAuthedProcedure.query(async () => {
    return withDefaults(await db.getSettings());
  }),

  adminSet: adminAuthedProcedure
    .input(
      z.object({
        key: z.enum(Object.keys(SETTING_DEFAULTS) as [SettingKey, ...SettingKey[]]),
        value: z.string().max(2048),
      })
    )
    .mutation(async ({ input }) => {
      await db.setSetting(input.key, input.value);
      return { success: true };
    }),
});
