import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { hashPassword, verifyPassword } from "./_core/password";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import {
  getUserByEmail,
  getUserByPhone,
  upsertUser,
} from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { analyticsRouter } from "./routers/analytics";
import { claimsRouter } from "./routers/claims";
import { clubsRouter } from "./routers/clubs";
import { eventsRouter } from "./routers/events";
import { reviewsRouter } from "./routers/reviews";
import { sessionsRouter } from "./routers/sessions";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    signup: publicProcedure
      .input(
        z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
            confirmPassword: z.string().min(8),
          })
          .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
          })
      )
      .mutation(async ({ input, ctx }) => {
        const email = input.email.trim().toLowerCase();
        const existing = await getUserByEmail(email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }

        const openId = `local_${nanoid(16)}`;
        const passwordHash = await hashPassword(input.password);
        const name = email.split("@")[0] || "User";

        await upsertUser({
          openId,
          email,
          name,
          passwordHash,
          loginMethod: "email_password",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, { name });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        return { success: true } as const;
      }),
    login: publicProcedure
      .input(
        z
          .object({
            email: z.string().email().optional(),
            phone: z.string().min(7).max(20).optional(),
            password: z.string().min(8),
          })
          .refine((data) => Boolean(data.email || data.phone), {
            message: "Email or phone is required",
            path: ["email"],
          })
      )
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email?.trim().toLowerCase();
        const normalizedPhone = input.phone?.trim();
        const user = normalizedPhone
          ? await getUserByPhone(normalizedPhone)
          : await getUserByEmail(normalizedEmail ?? "");

        if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        await upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
          phone: normalizedPhone ?? user.phone ?? null,
        });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name ?? "User",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
