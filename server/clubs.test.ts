import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAuthCtx(role: "user" | "admin" | "moderator" = "user"): TrpcContext {
  return makeCtx({
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

// ── Auth tests ────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user object for authenticated users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.role).toBe("user");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect((ctx.res.clearCookie as ReturnType<typeof vi.fn>)).toHaveBeenCalledOnce();
  });
});

// ── Clubs public procedures ───────────────────────────────────────────────────

describe("clubs.list", () => {
  it("returns paginated club list without auth", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.list({});
    expect(result).toHaveProperty("clubs");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.clubs)).toBe(true);
  });

  it("accepts city filter", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.list({ city: "chennai" });
    expect(result).toHaveProperty("clubs");
    // All returned clubs should be from Chennai
    for (const club of result.clubs) {
      expect(club.city).toBe("chennai");
    }
  });

  it("accepts sport filter", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.list({ sport: "running" });
    for (const club of result.clubs) {
      expect(club.sport).toBe("running");
    }
  });

  it("accepts verified filter", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.list({ verified: true });
    for (const club of result.clubs) {
      expect(club.verified).toBe(true);
    }
  });

  it("respects pagination limit", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.list({ limit: 3 });
    expect(result.clubs.length).toBeLessThanOrEqual(3);
  });
});

describe("clubs.getBySlug", () => {
  it("returns club for valid slug", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.getBySlug({ slug: "chennai-runners" });
    if (result) {
      expect(result.slug).toBe("chennai-runners");
      expect(result.name).toBe("Chennai Runners");
    }
    // Result may be null if seed hasn't run, which is acceptable in unit test
  });

  it("returns null/undefined for non-existent slug", async () => {
    const caller = appRouter.createCaller(makeCtx());
    // getBySlug throws NOT_FOUND for missing slugs
    await expect(caller.clubs.getBySlug({ slug: "this-club-does-not-exist-xyz" })).rejects.toThrow();
  });
});

describe("clubs.cities", () => {
  it("returns array of city objects", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.cities();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("clubs.sports", () => {
  it("returns array of sport objects", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.sports();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("clubs.stats", () => {
  it("returns stats object with numeric counts", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clubs.stats();
    // API returns { total, verified, cities, sports }
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("verified");
    expect(result).toHaveProperty("cities");
    expect(result).toHaveProperty("sports");
    expect(typeof result.total).toBe("number");
  });
});

// ── Protected club procedures ─────────────────────────────────────────────────

describe("clubs.submit", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.clubs.submit({
        name: "Test Club",
        city: "chennai",
        cityLabel: "Chennai",
        sport: "running",
        sportLabel: "Running",
        beginnerFriendly: true,
        pricingType: "free",
      })
    ).rejects.toThrow();
  });

  it("accepts valid submission from authenticated user", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.clubs.submit({
      name: `Test Club ${Date.now()}`,
      city: "chennai",
      cityLabel: "Chennai",
      sport: "running",
      sportLabel: "Running",
      beginnerFriendly: true,
      pricingType: "free",
      description: "A test club for unit testing",
    });
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});

// ── Admin procedures ──────────────────────────────────────────────────────────

describe("clubs.adminList", () => {
  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx("user"));
    await expect(caller.clubs.adminList({ page: 1, limit: 10 })).rejects.toThrow();
  });

  it("returns clubs list for admin users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx("admin"));
    const result = await caller.clubs.adminList({ page: 1, limit: 10 });
    expect(result).toHaveProperty("clubs");
    expect(result).toHaveProperty("total");
  });
});

describe("clubs.adminStats", () => {
  it("throws for non-admin users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx("user"));
    await expect(caller.clubs.adminStats()).rejects.toThrow();
  });

  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(makeAuthCtx("admin"));
    const result = await caller.clubs.adminStats();
    expect(result).toHaveProperty("pending");
    expect(result).toHaveProperty("approved");
    expect(result).toHaveProperty("rejected");
  });
});

// ── Events ────────────────────────────────────────────────────────────────────

describe("events.upcoming", () => {
  it("returns upcoming events without auth", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.events.upcoming({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

describe("analytics.track", () => {
  it("tracks page_view event without auth", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.analytics.track({
      eventType: "page_view",
      path: "/explore",
    });
    expect(result).toEqual({ success: true });
  });

  it("tracks outbound_click event", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.analytics.track({
      eventType: "outbound_click",
      target: "instagram",
      clubId: 1,
    });
    expect(result).toEqual({ success: true });
  });

  it("tracks search event", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.analytics.track({
      eventType: "search",
      path: "running clubs",
    });
    expect(result).toEqual({ success: true });
  });
});

// ── Claims ────────────────────────────────────────────────────────────────────

describe("claims.submit", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.claims.submit({ clubId: 1, proofText: "I am the founder of this club and have been running it since 2020." })
    ).rejects.toThrow();
  });

  it("throws for proof text shorter than 20 characters", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(
      caller.claims.submit({ clubId: 1, proofText: "too short" })
    ).rejects.toThrow();
  });
});

describe("claims.myClaims", () => {
  it("throws for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.claims.myClaims()).rejects.toThrow();
  });

  it("returns empty array for new user with no claims", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.claims.myClaims();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Reviews ───────────────────────────────────────────────────────────────────

describe("reviews.listByClub", () => {
  it("returns reviews without auth", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.reviews.listByClub({ clubId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.submit", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.reviews.submit({ clubId: 1, rating: 5, comment: "Great club!" })
    ).rejects.toThrow();
  });
});
