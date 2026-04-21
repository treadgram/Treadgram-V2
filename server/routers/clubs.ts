import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createClub,
  getAdminClubStats,
  getClubById,
  getClubBySlug,
  getClubStats,
  getClubsByOwner,
  getClubsBySubmitter,
  incrementClubViewCount,
  listAllClubsForAdmin,
  listCities,
  listClubs,
  listSports,
  updateClub,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ClubFiltersSchema = z.object({
  city: z.string().optional(),
  sport: z.string().optional(),
  beginnerFriendly: z.boolean().optional(),
  pricingType: z.enum(["free", "paid", "donation"]).optional(),
  verified: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

const ClubInputSchema = z.object({
  name: z.string().min(3).max(256),
  city: z.string().min(2).max(64),
  cityLabel: z.string().min(2).max(64),
  sport: z.string().min(2).max(64),
  sportLabel: z.string().min(2).max(64),
  description: z.string().optional(),
  shortDescription: z.string().max(280).optional(),
  beginnerFriendly: z.boolean().default(false),
  pricingType: z.enum(["free", "paid", "donation"]).default("free"),
  monthlyFeeInr: z.number().int().nonnegative().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  address: z.string().optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  whatsappUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const clubsRouter = router({
  // ── Public ──────────────────────────────────────────────────────────────────

  list: publicProcedure.input(ClubFiltersSchema).query(async ({ input }) => {
    return listClubs(input);
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const club = await getClubBySlug(input.slug);
      if (!club || club.status !== "approved") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Club not found" });
      }
      await incrementClubViewCount(club.id);
      return club;
    }),

  cities: publicProcedure.query(async () => listCities()),

  sports: publicProcedure.query(async () => listSports()),

  stats: publicProcedure.query(async () => getClubStats()),

  // ── Protected: Club submission ───────────────────────────────────────────────

  submit: protectedProcedure.input(ClubInputSchema).mutation(async ({ input, ctx }) => {
    const baseSlug = slugify(`${input.city}-${input.name}`);
    // Ensure slug uniqueness by appending timestamp if needed
    const existing = await getClubBySlug(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    await createClub({
      ...input,
      slug,
      status: "pending",
      verified: false,
      submittedBy: ctx.user.id,
      instagramUrl: input.instagramUrl || null,
      whatsappUrl: input.whatsappUrl || null,
      websiteUrl: input.websiteUrl || null,
      coverImageUrl: input.coverImageUrl || null,
      logoUrl: input.logoUrl || null,
      monthlyFeeInr: input.monthlyFeeInr ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      address: input.address ?? null,
      description: input.description ?? null,
      shortDescription: input.shortDescription ?? null,
    });

    await notifyOwner({
      title: "New Club Submission",
      content: `${ctx.user.name ?? "A user"} submitted "${input.name}" in ${input.cityLabel} for ${input.sportLabel}.`,
    });

    return { success: true, slug };
  }),

  // ── Protected: Club owner edit ───────────────────────────────────────────────

  update: protectedProcedure
    .input(ClubInputSchema.extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const club = await getClubById(input.id);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = club.ownedBy === ctx.user.id;
      const isMod = ctx.user.role === "admin" || ctx.user.role === "moderator";
      if (!isOwner && !isMod) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...rest } = input;
      await updateClub(id, {
        ...rest,
        instagramUrl: rest.instagramUrl || null,
        whatsappUrl: rest.whatsappUrl || null,
        websiteUrl: rest.websiteUrl || null,
        coverImageUrl: rest.coverImageUrl || null,
        logoUrl: rest.logoUrl || null,
        monthlyFeeInr: rest.monthlyFeeInr ?? null,
        lat: rest.lat ?? null,
        lng: rest.lng ?? null,
        address: rest.address ?? null,
        description: rest.description ?? null,
        shortDescription: rest.shortDescription ?? null,
      });
      return { success: true };
    }),

  // ── Protected: My clubs ──────────────────────────────────────────────────────

  myClubs: protectedProcedure.query(async ({ ctx }) => {
    const [owned, submitted] = await Promise.all([
      getClubsByOwner(ctx.user.id),
      getClubsBySubmitter(ctx.user.id),
    ]);
    // Merge and deduplicate
    const seen = new Set<number>();
    const all = [];
    for (const c of [...owned, ...submitted]) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        all.push(c);
      }
    }
    return all;
  }),

  // ── Admin / Moderator ────────────────────────────────────────────────────────

  adminList: adminProcedure
    .input(z.object({ page: z.number().int().positive().default(1), limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => listAllClubsForAdmin(input.page, input.limit)),

  adminStats: adminProcedure.query(async () => getAdminClubStats()),

  approve: adminProcedure
    .input(z.object({ id: z.number().int(), note: z.string().optional() }))
    .mutation(async ({ input }) => {
      const club = await getClubById(input.id);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });
      await updateClub(input.id, { status: "approved", moderatorNote: input.note ?? null });
      return { success: true };
    }),

  reject: adminProcedure
    .input(z.object({ id: z.number().int(), note: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const club = await getClubById(input.id);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });
      await updateClub(input.id, { status: "rejected", moderatorNote: input.note });
      return { success: true };
    }),

  toggleVerified: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const club = await getClubById(input.id);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });
      await updateClub(input.id, { verified: !club.verified });
      return { success: true, verified: !club.verified };
    }),
});
