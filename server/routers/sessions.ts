import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSession, deleteSession, getClubById, listSessionsByClub, updateSession } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const SessionInputSchema = z.object({
  clubId: z.number().int(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationName: z.string().max(256).optional(),
  notes: z.string().optional(),
});

async function assertClubOwner(clubId: number, userId: number, role: string) {
  const club = await getClubById(clubId);
  if (!club) throw new TRPCError({ code: "NOT_FOUND", message: "Club not found" });
  if (club.ownedBy !== userId && role !== "admin" && role !== "moderator") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return club;
}

export const sessionsRouter = router({
  listByClub: publicProcedure
    .input(z.object({ clubId: z.number().int() }))
    .query(async ({ input }) => listSessionsByClub(input.clubId)),

  create: protectedProcedure.input(SessionInputSchema).mutation(async ({ input, ctx }) => {
    await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
    await createSession({
      ...input,
      endTime: input.endTime ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      locationName: input.locationName ?? null,
      notes: input.notes ?? null,
    });
    return { success: true };
  }),

  update: protectedProcedure
    .input(SessionInputSchema.extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
      const { id, ...rest } = input;
      await updateSession(id, {
        ...rest,
        endTime: rest.endTime ?? null,
        lat: rest.lat ?? null,
        lng: rest.lng ?? null,
        locationName: rest.locationName ?? null,
        notes: rest.notes ?? null,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int(), clubId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
      await deleteSession(input.id);
      return { success: true };
    }),
});
