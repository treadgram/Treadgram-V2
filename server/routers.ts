import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { timingSafeEqual } from "node:crypto";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { hashPassword, verifyPassword } from "./_core/password";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import {
  getUserByEmail,
  getUserByPhone,
  listAllUsers,
  listRecentUsers,
  upsertUser,
} from "./db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { analyticsRouter } from "./routers/analytics";
import { claimsRouter } from "./routers/claims";
import { clubsRouter } from "./routers/clubs";
import { eventsRouter } from "./routers/events";
import { reviewsRouter } from "./routers/reviews";
import { sessionsRouter } from "./routers/sessions";

function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    signup: publicProcedure
      .input(
        z
          .object({
            name: z.string().min(2).max(100),
            email: z.string().email(),
            phone: z.string().min(7).max(20).optional(),
            password: z.string().min(8),
            confirmPassword: z.string().min(8),
          })
          .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
          })
      )
      .mutation(async ({ input, ctx }) => {
        const name = input.name.trim();
        const email = input.email.trim().toLowerCase();
        const phone = input.phone?.trim() || null;
        const existing = await getUserByEmail(email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }
        if (phone) {
          const existingPhone = await getUserByPhone(phone);
          if (existingPhone) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Phone already registered",
            });
          }
        }

        const openId = `local_${nanoid(16)}`;
        const passwordHash = await hashPassword(input.password);

        await upsertUser({
          openId,
          email,
          phone,
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
    /** Owner-only login for `/system` console (credentials from env, not public signup). */
    systemAdminLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const expectedEmail = ENV.systemAdminEmail.trim().toLowerCase();
        const expectedPassword = ENV.systemAdminPassword;
        if (!expectedEmail || !expectedPassword) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "System console is not configured (set SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD)",
          });
        }

        const email = input.email.trim().toLowerCase();
        if (
          !timingSafeStringEqual(email, expectedEmail) ||
          !timingSafeStringEqual(input.password, expectedPassword)
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const openId = ENV.systemOwnerOpenId;
        await upsertUser({
          openId,
          email,
          name: "System Owner",
          role: "admin",
          loginMethod: "system_console",
          passwordHash: null,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, { name: "System Owner" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

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
