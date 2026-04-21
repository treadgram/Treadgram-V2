import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createReview, getClubById, getUserReviewForClub, listReviewsByClub } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const reviewsRouter = router({
  listByClub: publicProcedure
    .input(z.object({ clubId: z.number().int() }))
    .query(async ({ input }) => listReviewsByClub(input.clubId)),

  myReview: protectedProcedure
    .input(z.object({ clubId: z.number().int() }))
    .query(async ({ input, ctx }) => getUserReviewForClub(ctx.user.id, input.clubId)),

  create: protectedProcedure
    .input(
      z.object({
        clubId: z.number().int(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const club = await getClubById(input.clubId);
      if (!club || club.status !== "approved") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Club not found" });
      }

      const existing = await getUserReviewForClub(ctx.user.id, input.clubId);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You have already reviewed this club" });
      }

      await createReview({
        clubId: input.clubId,
        userId: ctx.user.id,
        rating: input.rating,
        comment: input.comment ?? null,
      });

      return { success: true };
    }),
});
