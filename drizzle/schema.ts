import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("role", ["user", "admin", "moderator"]);
export const clubStatusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const pricingTypeEnum = pgEnum("pricingType", ["free", "paid", "donation"]);
export const claimStatusEnum = pgEnum("claim_status", ["pending", "approved", "rejected"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Clubs ────────────────────────────────────────────────────────────────────

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  /** URL-safe slug derived from name + city, e.g. "chennai-runners-club" */
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  /** Normalised city key, e.g. "chennai", "mumbai" */
  city: varchar("city", { length: 64 }).notNull(),
  /** Display name for city, e.g. "Chennai" */
  cityLabel: varchar("cityLabel", { length: 64 }).notNull(),
  /** Normalised sport key, e.g. "running", "cycling" */
  sport: varchar("sport", { length: 64 }).notNull(),
  /** Display name for sport, e.g. "Running", "Cycling" */
  sportLabel: varchar("sportLabel", { length: 64 }).notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 280 }),
  /** Submission status: pending → approved / rejected */
  status: clubStatusEnum("status").default("pending").notNull(),
  /** Verified badge – set by moderators after manual review */
  verified: boolean("verified").default(false).notNull(),
  /** Whether the club is beginner-friendly */
  beginnerFriendly: boolean("beginnerFriendly").default(false).notNull(),
  pricingType: pricingTypeEnum("pricingType").default("free").notNull(),
  /** Monthly fee in INR, if applicable */
  monthlyFeeInr: integer("monthlyFeeInr"),
  /** Primary meeting latitude */
  lat: real("lat"),
  /** Primary meeting longitude */
  lng: real("lng"),
  /** Human-readable address */
  address: text("address"),
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  whatsappUrl: varchar("whatsappUrl", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  /** Cover image URL (stored in S3) */
  coverImageUrl: varchar("coverImageUrl", { length: 1024 }),
  /** Logo image URL (stored in S3) */
  logoUrl: varchar("logoUrl", { length: 1024 }),
  /** User who submitted this club */
  submittedBy: integer("submittedBy").references(() => users.id),
  /** User who currently owns/admins this club (after claim approval) */
  ownedBy: integer("ownedBy").references(() => users.id),
  /** Moderator note on approval/rejection */
  moderatorNote: text("moderatorNote"),
  /** Total average rating (denormalised for performance) */
  avgRating: decimal("avgRating", { precision: 3, scale: 2 }),
  reviewCount: integer("reviewCount").default(0).notNull(),
  /** Page view count (analytics) */
  viewCount: integer("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

// ─── Sessions (recurring weekly meetups) ─────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  clubId: integer("clubId").notNull().references(() => clubs.id),
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: integer("dayOfWeek").notNull(),
  /** HH:MM 24-hour format, e.g. "06:00" */
  startTime: varchar("startTime", { length: 8 }).notNull(),
  /** HH:MM 24-hour format */
  endTime: varchar("endTime", { length: 8 }),
  /** Meeting point latitude */
  lat: real("lat"),
  /** Meeting point longitude */
  lng: real("lng"),
  locationName: varchar("locationName", { length: 256 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// ─── Events (one-off open sessions / races / meetups) ─────────────────────────

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  clubId: integer("clubId").notNull().references(() => clubs.id),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  /** UTC Unix timestamp (ms) */
  datetimeUtc: timestamp("datetimeUtc").notNull(),
  /** Whether non-members can join */
  isOpen: boolean("isOpen").default(true).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  locationName: varchar("locationName", { length: 256 }),
  registrationUrl: varchar("registrationUrl", { length: 512 }),
  maxParticipants: integer("maxParticipants"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Claims (user requests to own a club) ─────────────────────────────────────

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  clubId: integer("clubId").notNull().references(() => clubs.id),
  userId: integer("userId").notNull().references(() => users.id),
  /** Proof text: role in club, contact info, etc. */
  proofText: text("proofText"),
  status: claimStatusEnum("status").default("pending").notNull(),
  moderatorNote: text("moderatorNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  clubId: integer("clubId").notNull().references(() => clubs.id),
  userId: integer("userId").notNull().references(() => users.id),
  /** 1–5 star rating */
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Analytics Events ─────────────────────────────────────────────────────────

export const analyticsEvents = pgTable("analyticsEvents", {
  id: serial("id").primaryKey(),
  /** "page_view" | "outbound_click" | "search" */
  eventType: varchar("eventType", { length: 64 }).notNull(),
  /** Page path or club slug */
  path: varchar("path", { length: 512 }),
  /** For outbound clicks: "instagram" | "whatsapp" | "website" */
  target: varchar("target", { length: 64 }),
  clubId: integer("clubId").references(() => clubs.id),
  userId: integer("userId").references(() => users.id),
  /** Anonymous session identifier */
  sessionId: varchar("sessionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
