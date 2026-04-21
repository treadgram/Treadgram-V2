import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createEvent, deleteEvent, getClubById, listUpcomingEvents, updateEvent } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const EventInputSchema = z.object({
  clubId: z.number().int(),
  title: z.string().min(3).max(256),
  description: z.string().optional(),
  datetimeUtc: z.date(),
  isOpen: z.boolean().default(true),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationName: z.string().max(256).optional(),
  registrationUrl: z.string().url().optional().or(z.literal("")),
  maxParticipants: z.number().int().positive().optional(),
});

async function assertClubOwner(clubId: number, userId: number, role: string) {
  const club = await getClubById(clubId);
  if (!club) throw new TRPCError({ code: "NOT_FOUND" });
  if (club.ownedBy !== userId && role !== "admin" && role !== "moderator") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return club;
}

export const eventsRouter = router({
  upcoming: publicProcedure
    .input(z.object({ clubId: z.number().int().optional(), limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => listUpcomingEvents(input.clubId, input.limit)),

  create: protectedProcedure.input(EventInputSchema).mutation(async ({ input, ctx }) => {
    await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
    await createEvent({
      ...input,
      description: input.description ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      locationName: input.locationName ?? null,
      registrationUrl: input.registrationUrl || null,
      maxParticipants: input.maxParticipants ?? null,
    });
    return { success: true };
  }),

  update: protectedProcedure
    .input(EventInputSchema.extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
      const { id, ...rest } = input;
      await updateEvent(id, {
        ...rest,
        description: rest.description ?? null,
        lat: rest.lat ?? null,
        lng: rest.lng ?? null,
        locationName: rest.locationName ?? null,
        registrationUrl: rest.registrationUrl || null,
        maxParticipants: rest.maxParticipants ?? null,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int(), clubId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await assertClubOwner(input.clubId, ctx.user.id, ctx.user.role);
      await deleteEvent(input.id);
      return { success: true };
    }),
});
