import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { listAllUsers, listRecentUsers } from "./db";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { analyticsRouter } from "./routers/analytics";
import { claimsRouter } from "./routers/claims";
import { clubsRouter } from "./routers/clubs";
import { eventsRouter } from "./routers/events";
import { reviewsRouter } from "./routers/reviews";
import { sessionsRouter } from "./routers/sessions";

type CookieCapableResponse = {
  cookie(name: string, value: string, options?: Record<string, unknown>): void;
  clearCookie(name: string, options?: Record<string, unknown>): void;
};

function withCookieResponse(res: unknown): CookieCapableResponse {
  return res as CookieCapableResponse;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      withCookieResponse(ctx.res).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    recentUsers: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(25) }).optional())
      .query(async ({ input }) => {
        return listRecentUsers(input?.limit ?? 25);
      }),
    allUsers: adminProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(100).default(50),
          search: z.string().optional(),
          role: z.enum(["user", "admin", "moderator"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return listAllUsers({
          page: input.page,
          limit: input.limit,
          search: input.search,
          role: input.role,
        });
      }),
  }),

  clubs: clubsRouter,
  sessions: sessionsRouter,
  events: eventsRouter,
  claims: claimsRouter,
  reviews: reviewsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

