CREATE TYPE "public"."claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."pricingType" AS ENUM('free', 'paid', 'donation');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TABLE "analyticsEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventType" varchar(64) NOT NULL,
	"path" varchar(512),
	"target" varchar(64),
	"clubId" integer,
	"userId" integer,
	"sessionId" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer NOT NULL,
	"userId" integer NOT NULL,
	"proofText" text,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"moderatorNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"city" varchar(64) NOT NULL,
	"cityLabel" varchar(64) NOT NULL,
	"sport" varchar(64) NOT NULL,
	"sportLabel" varchar(64) NOT NULL,
	"description" text,
	"shortDescription" varchar(280),
	"status" "status" DEFAULT 'pending' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"beginnerFriendly" boolean DEFAULT false NOT NULL,
	"pricingType" "pricingType" DEFAULT 'free' NOT NULL,
	"monthlyFeeInr" integer,
	"lat" real,
	"lng" real,
	"address" text,
	"instagramUrl" varchar(512),
	"whatsappUrl" varchar(512),
	"websiteUrl" varchar(512),
	"coverImageUrl" varchar(1024),
	"logoUrl" varchar(1024),
	"submittedBy" integer,
	"ownedBy" integer,
	"moderatorNote" text,
	"avgRating" numeric(3, 2),
	"reviewCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clubs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"datetimeUtc" timestamp NOT NULL,
	"isOpen" boolean DEFAULT true NOT NULL,
	"lat" real,
	"lng" real,
	"locationName" varchar(256),
	"registrationUrl" varchar(512),
	"maxParticipants" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer NOT NULL,
	"userId" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" varchar(8) NOT NULL,
	"endTime" varchar(8),
	"lat" real,
	"lng" real,
	"locationName" varchar(256),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"passwordHash" text,
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "analyticsEvents" ADD CONSTRAINT "analyticsEvents_clubId_clubs_id_fk" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analyticsEvents" ADD CONSTRAINT "analyticsEvents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_clubId_clubs_id_fk" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_submittedBy_users_id_fk" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_ownedBy_users_id_fk" FOREIGN KEY ("ownedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_clubId_clubs_id_fk" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clubId_clubs_id_fk" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_clubId_clubs_id_fk" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;