import { and, asc, desc, eq, gt, ilike, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  type InsertAnalyticsEvent,
  type InsertClaim,
  type InsertClub,
  type InsertEvent,
  type InsertReview,
  type InsertSession,
  type InsertUser,
  analyticsEvents,
  claims,
  clubs,
  events,
  reviews,
  sessions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connectionString = process.env.DATABASE_URL;
      const parsedUrl = new URL(connectionString);
      const isLocalDb = parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";
      const needsRelaxedSsl = !isLocalDb && process.env.NODE_ENV !== "production";
      _pool = new Pool({
        connectionString,
        options: "-c search_path=public",
        ssl: needsRelaxedSsl ? { rejectUnauthorized: false } : false,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "phone", "passwordHash", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function listRecentUsers(limit = 25) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      loginMethod: users.loginMethod,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export interface AdminUserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin" | "moderator";
}

export async function listAllUsers(filters: AdminUserListFilters = {}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 100);
  const offset = (page - 1) * limit;
  const conditions = [];
  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(users.email, q),
        ilike(users.name, q),
        ilike(users.openId, q),
        ilike(users.phone, q)
      )!
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users).where(where),
  ]);
  return { users: rows, total: Number(countRows[0]?.count ?? 0) };
}

// ─── Clubs ────────────────────────────────────────────────────────────────────

export interface ClubFilters {
  city?: string;
  sport?: string;
  beginnerFriendly?: boolean;
  pricingType?: "free" | "paid" | "donation";
  verified?: boolean;
  status?: "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
}

export async function listClubs(filters: ClubFilters = {}) {
  const db = await getDb();
  if (!db) return { clubs: [], total: 0 };

  const { city, sport, beginnerFriendly, pricingType, verified, status = "approved", search, page = 1, limit = 12 } = filters;

  const conditions = [eq(clubs.status, status)];

  if (city) conditions.push(eq(clubs.city, city));
  if (sport) conditions.push(eq(clubs.sport, sport));
  if (beginnerFriendly !== undefined) conditions.push(eq(clubs.beginnerFriendly, beginnerFriendly));
  if (pricingType) conditions.push(eq(clubs.pricingType, pricingType));
  if (verified !== undefined) conditions.push(eq(clubs.verified, verified));
  if (search) {
    conditions.push(
      or(
        like(clubs.name, `%${search}%`),
        like(clubs.cityLabel, `%${search}%`),
        like(clubs.sportLabel, `%${search}%`),
        like(clubs.shortDescription, `%${search}%`)
      )!
    );
  }

  const where = and(...conditions);
  const offset = (page - 1) * limit;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(clubs)
      .where(where)
      .orderBy(desc(clubs.verified), desc(clubs.avgRating), desc(clubs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(clubs).where(where),
  ]);

  return { clubs: rows, total: Number(countRows[0]?.count ?? 0) };
}

export async function getClubBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clubs).where(eq(clubs.slug, slug)).limit(1);
  return result[0];
}

export async function getClubById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
  return result[0];
}

export async function createClub(data: InsertClub) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(clubs).values(data);
}

export async function updateClub(id: number, data: Partial<InsertClub>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(clubs).set(data).where(eq(clubs.id, id));
}

export async function incrementClubViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(clubs).set({ viewCount: sql`${clubs.viewCount} + 1` }).where(eq(clubs.id, id));
}

export async function listCities() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .selectDistinct({ city: clubs.city, cityLabel: clubs.cityLabel })
    .from(clubs)
    .where(eq(clubs.status, "approved"))
    .orderBy(asc(clubs.cityLabel));
  return rows;
}

export async function listSports() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .selectDistinct({ sport: clubs.sport, sportLabel: clubs.sportLabel })
    .from(clubs)
    .where(eq(clubs.status, "approved"))
    .orderBy(asc(clubs.sportLabel));
  return rows;
}

export async function getClubStats() {
  const db = await getDb();
  if (!db) return { total: 0, verified: 0, cities: 0, sports: 0 };
  const [total, verifiedCount, cityCount, sportCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(clubs).where(eq(clubs.status, "approved")),
    db.select({ count: sql<number>`count(*)` }).from(clubs).where(and(eq(clubs.status, "approved"), eq(clubs.verified, true))),
    db.select({ count: sql<number>`count(distinct ${clubs.city})` }).from(clubs).where(eq(clubs.status, "approved")),
    db.select({ count: sql<number>`count(distinct ${clubs.sport})` }).from(clubs).where(eq(clubs.status, "approved")),
  ]);
  return {
    total: Number(total[0]?.count ?? 0),
    verified: Number(verifiedCount[0]?.count ?? 0),
    cities: Number(cityCount[0]?.count ?? 0),
    sports: Number(sportCount[0]?.count ?? 0),
  };
}

export async function getAdminClubStats() {
  const db = await getDb();
  if (!db) return { pending: 0, approved: 0, rejected: 0 };
  const rows = await db
    .select({ status: clubs.status, count: sql<number>`count(*)` })
    .from(clubs)
    .groupBy(clubs.status);
  const map: Record<string, number> = {};
  for (const r of rows) map[r.status] = Number(r.count);
  return { pending: map.pending ?? 0, approved: map.approved ?? 0, rejected: map.rejected ?? 0 };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function listSessionsByClub(clubId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.clubId, clubId)).orderBy(asc(sessions.dayOfWeek), asc(sessions.startTime));
}

export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(sessions).values(data);
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(sessions).where(eq(sessions.id, id));
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function listUpcomingEvents(clubId?: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const conditions = [gt(events.datetimeUtc, now)];
  if (clubId) conditions.push(eq(events.clubId, clubId));
  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(asc(events.datetimeUtc))
    .limit(limit);
}

/** Upcoming events with host club fields for marketing grids */
export async function listUpcomingEventsForFeed(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select({
      id: events.id,
      clubId: events.clubId,
      title: events.title,
      description: events.description,
      datetimeUtc: events.datetimeUtc,
      isOpen: events.isOpen,
      lat: events.lat,
      lng: events.lng,
      locationName: events.locationName,
      registrationUrl: events.registrationUrl,
      maxParticipants: events.maxParticipants,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      clubCityLabel: clubs.cityLabel,
      clubCoverImageUrl: clubs.coverImageUrl,
      clubSlug: clubs.slug,
    })
    .from(events)
    .innerJoin(clubs, eq(events.clubId, clubs.id))
    .where(gt(events.datetimeUtc, now))
    .orderBy(asc(events.datetimeUtc))
    .limit(limit);
}

export async function getEventWithClubById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: events.id,
      clubId: events.clubId,
      title: events.title,
      description: events.description,
      datetimeUtc: events.datetimeUtc,
      isOpen: events.isOpen,
      lat: events.lat,
      lng: events.lng,
      locationName: events.locationName,
      registrationUrl: events.registrationUrl,
      maxParticipants: events.maxParticipants,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      clubName: clubs.name,
      clubSlug: clubs.slug,
      clubCityLabel: clubs.cityLabel,
      clubCoverImageUrl: clubs.coverImageUrl,
      clubLogoUrl: clubs.logoUrl,
      pricingType: clubs.pricingType,
      monthlyFeeInr: clubs.monthlyFeeInr,
    })
    .from(events)
    .innerJoin(clubs, eq(events.clubId, clubs.id))
    .where(eq(events.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(events).values(data);
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(events).where(eq(events.id, id));
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export async function createClaim(data: InsertClaim) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(claims).values(data);
}

export async function listPendingClaims() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(claims).where(eq(claims.status, "pending")).orderBy(asc(claims.createdAt));
}

export async function getClaimById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
  return result[0];
}

export async function updateClaim(id: number, data: Partial<InsertClaim>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(claims).set(data).where(eq(claims.id, id));
}

export async function getUserClaims(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(claims).where(eq(claims.userId, userId)).orderBy(desc(claims.createdAt));
}

export async function getClubClaims(clubId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(claims).where(eq(claims.clubId, clubId)).orderBy(desc(claims.createdAt));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function listReviewsByClub(clubId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: reviews.id,
      clubId: reviews.clubId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.clubId, clubId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(reviews).values(data);
  // Recalculate avg rating
  const stats = await db
    .select({ avg: sql<number>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.clubId, data.clubId));
  if (stats[0]) {
    await db
      .update(clubs)
      .set({ avgRating: String(Number(stats[0].avg).toFixed(2)), reviewCount: Number(stats[0].count) })
      .where(eq(clubs.id, data.clubId));
  }
}

export async function getUserReviewForClub(userId: number, clubId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.clubId, clubId)))
    .limit(1);
  return result[0];
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function trackAnalyticsEvent(data: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(analyticsEvents).values(data);
  } catch {
    // Non-critical — swallow errors
  }
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { pageViews: 0, outboundClicks: 0, searches: 0 };
  const rows = await db
    .select({ eventType: analyticsEvents.eventType, count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .groupBy(analyticsEvents.eventType);
  const map: Record<string, number> = {};
  for (const r of rows) map[r.eventType] = Number(r.count);
  return {
    pageViews: map.page_view ?? 0,
    outboundClicks: map.outbound_click ?? 0,
    searches: map.search ?? 0,
  };
}

export async function getClubsByOwner(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clubs).where(eq(clubs.ownedBy, userId)).orderBy(desc(clubs.createdAt));
}

export async function getClubsBySubmitter(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clubs).where(eq(clubs.submittedBy, userId)).orderBy(desc(clubs.createdAt));
}

export interface AdminClubListFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  verified?: boolean;
  search?: string;
  city?: string;
  sport?: string;
}

export async function listClubsForAdmin(filters: AdminClubListFilters = {}) {
  const db = await getDb();
  if (!db) return { clubs: [], total: 0 };
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const offset = (page - 1) * limit;
  const conditions = [];
  if (filters.status) conditions.push(eq(clubs.status, filters.status));
  if (filters.verified !== undefined) conditions.push(eq(clubs.verified, filters.verified));
  if (filters.city?.trim()) {
    const c = `%${filters.city.trim()}%`;
    conditions.push(or(ilike(clubs.city, c), ilike(clubs.cityLabel, c))!);
  }
  if (filters.sport?.trim()) {
    const s = `%${filters.sport.trim()}%`;
    conditions.push(or(ilike(clubs.sport, s), ilike(clubs.sportLabel, s))!);
  }
  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(clubs.name, q),
        ilike(clubs.slug, q),
        ilike(clubs.cityLabel, q),
        ilike(clubs.sportLabel, q),
        ilike(clubs.shortDescription, q),
        ilike(clubs.address, q)
      )!
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, countRows] = await Promise.all([
    db.select().from(clubs).where(where).orderBy(desc(clubs.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(clubs).where(where),
  ]);
  return { clubs: rows, total: Number(countRows[0]?.count ?? 0) };
}

export interface AdminEventListFilters {
  page?: number;
  limit?: number;
  clubId?: number;
  search?: string;
  isOpen?: boolean;
  timeRange?: "all" | "upcoming" | "past";
}

export async function listEventsForAdmin(filters: AdminEventListFilters = {}) {
  const db = await getDb();
  if (!db) return { events: [], total: 0 };
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const offset = (page - 1) * limit;
  const now = new Date();
  const conditions = [];
  if (filters.clubId) conditions.push(eq(events.clubId, filters.clubId));
  if (filters.isOpen !== undefined) conditions.push(eq(events.isOpen, filters.isOpen));
  const timeRange = filters.timeRange ?? "all";
  if (timeRange === "upcoming") conditions.push(gt(events.datetimeUtc, now));
  if (timeRange === "past") conditions.push(lte(events.datetimeUtc, now));
  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(events.title, q),
        ilike(events.description, q),
        ilike(events.locationName, q),
        ilike(clubs.name, q),
        ilike(clubs.slug, q)
      )!
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: events.id,
        clubId: events.clubId,
        title: events.title,
        description: events.description,
        datetimeUtc: events.datetimeUtc,
        isOpen: events.isOpen,
        lat: events.lat,
        lng: events.lng,
        locationName: events.locationName,
        registrationUrl: events.registrationUrl,
        maxParticipants: events.maxParticipants,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        clubName: clubs.name,
        clubSlug: clubs.slug,
      })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(where)
      .orderBy(desc(events.datetimeUtc))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(where),
  ]);
  return { events: rows, total: Number(countRows[0]?.count ?? 0) };
}
