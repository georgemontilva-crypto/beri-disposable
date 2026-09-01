import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminAuthRouter } from "./routers/adminAuth";
import { codesRouter } from "./routers/codes";
import { imagesRouter } from "./routers/images";
import { newsletterRouter } from "./routers/newsletter";
import { settingsRouter } from "./routers/settings";
import { wholesaleRouter } from "./routers/wholesale";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Beri Disposable feature routers (proprietary auth, public + admin)
  adminAuth: adminAuthRouter,
  codes: codesRouter,
  wholesale: wholesaleRouter,
  images: imagesRouter,
  newsletter: newsletterRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
