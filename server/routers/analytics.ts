import { z } from "zod";
import { getAnalyticsSummary, trackAnalyticsEvent } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const analyticsRouter = router({
  track: publicProcedure
    .input(
      z.object({
        eventType: z.enum(["page_view", "outbound_click", "search"]),
        path: z.string().max(512).optional(),
        target: z.string().max(64).optional(),
        clubId: z.number().int().optional(),
        sessionId: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await trackAnalyticsEvent({
        eventType: input.eventType,
        path: input.path ?? null,
        target: input.target ?? null,
        clubId: input.clubId ?? null,
        userId: ctx.user?.id ?? null,
        sessionId: input.sessionId ?? null,
      });
      return { success: true };
    }),

  summary: adminProcedure.query(async () => getAnalyticsSummary()),
});
