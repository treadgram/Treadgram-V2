import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createClaim,
  getClaimById,
  getClubById,
  getClubClaims,
  getUserClaims,
  listPendingClaims,
  updateClaim,
  updateClub,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

export const claimsRouter = router({
  // User submits a claim for a club
  submit: protectedProcedure
    .input(
      z.object({
        clubId: z.number().int(),
        proofText: z.string().min(20, "Please provide at least 20 characters of proof"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const club = await getClubById(input.clubId);
      if (!club) throw new TRPCError({ code: "NOT_FOUND", message: "Club not found" });
      if (club.ownedBy) throw new TRPCError({ code: "CONFLICT", message: "This club already has an owner" });

      // Check for existing pending claim by this user
      const existingClaims = await getUserClaims(ctx.user.id);
      const alreadyClaimed = existingClaims.some(
        (c) => c.clubId === input.clubId && c.status === "pending"
      );
      if (alreadyClaimed) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have a pending claim for this club" });
      }

      await createClaim({
        clubId: input.clubId,
        userId: ctx.user.id,
        proofText: input.proofText,
        status: "pending",
      });

      await notifyOwner({
        title: "New Club Claim",
        content: `${ctx.user.name ?? "A user"} has claimed "${club.name}". Review in admin dashboard.`,
      });

      return { success: true };
    }),

  // Get current user's claims
  myClaims: protectedProcedure.query(async ({ ctx }) => getUserClaims(ctx.user.id)),

  // Admin: list all pending claims
  pending: adminProcedure.query(async () => listPendingClaims()),

  // Admin: list claims for a specific club
  forClub: adminProcedure
    .input(z.object({ clubId: z.number().int() }))
    .query(async ({ input }) => getClubClaims(input.clubId)),

  // Admin: approve a claim → set club.ownedBy
  approve: adminProcedure
    .input(z.object({ id: z.number().int(), note: z.string().optional() }))
    .mutation(async ({ input }) => {
      const claim = await getClaimById(input.id);
      if (!claim) throw new TRPCError({ code: "NOT_FOUND" });

      await updateClaim(input.id, { status: "approved", moderatorNote: input.note ?? null });
      // Transfer ownership
      await updateClub(claim.clubId, { ownedBy: claim.userId });
      // Reject all other pending claims for this club
      const otherClaims = await getClubClaims(claim.clubId);
      for (const c of otherClaims) {
        if (c.id !== input.id && c.status === "pending") {
          await updateClaim(c.id, { status: "rejected", moderatorNote: "Another claim was approved" });
        }
      }
      return { success: true };
    }),

  // Admin: reject a claim
  reject: adminProcedure
    .input(z.object({ id: z.number().int(), note: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const claim = await getClaimById(input.id);
      if (!claim) throw new TRPCError({ code: "NOT_FOUND" });
      await updateClaim(input.id, { status: "rejected", moderatorNote: input.note });
      return { success: true };
    }),
});
