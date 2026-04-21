/**
 * Seed script — inserts 10 example sports clubs across Indian cities.
 * Run: npx tsx scripts/seed.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { clubs, events, sessions } from "../drizzle/schema";

const connection = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(connection);

const CLUBS = [
  {
    name: "Chennai Runners",
    slug: "chennai-runners",
    city: "chennai",
    cityLabel: "Chennai",
    sport: "running",
    sportLabel: "Running",
    shortDescription: "Tamil Nadu's largest running community with 2,000+ members across all pace groups.",
    description: "Chennai Runners was founded in 2012 and has grown into one of South India's most vibrant running communities. We host weekly group runs along the Marina Beach promenade, Besant Nagar beach, and Nungambakkam tracks. Whether you're a first-time 5K runner or a seasoned marathoner, you'll find your tribe here.",
    beginnerFriendly: true,
    pricingType: "free" as const,
    lat: 13.0827,
    lng: 80.2707,
    address: "Marina Beach, Chennai, Tamil Nadu 600001",
    instagramUrl: "https://instagram.com/chennairunners",
    whatsappUrl: "https://chat.whatsapp.com/example1",
    verified: true,
    status: "approved" as const,
    viewCount: 1240,
  },
  {
    name: "Mumbai Trail Blazers",
    slug: "mumbai-trail-blazers",
    city: "mumbai",
    cityLabel: "Mumbai",
    sport: "running",
    sportLabel: "Running",
    shortDescription: "Trail running and ultra-distance community based in Mumbai.",
    description: "Mumbai Trail Blazers specialises in trail running across the Sahyadri ranges and Sanjay Gandhi National Park. We organise monthly trail runs, night runs, and multi-day trekking expeditions.",
    beginnerFriendly: false,
    pricingType: "free" as const,
    lat: 19.0760,
    lng: 72.8777,
    address: "Sanjay Gandhi National Park, Borivali, Mumbai 400066",
    instagramUrl: "https://instagram.com/mumbaitrailblazers",
    verified: true,
    status: "approved" as const,
    viewCount: 890,
  },
  {
    name: "Bangalore Cycling Club",
    slug: "bangalore-cycling-club",
    city: "bangalore",
    cityLabel: "Bangalore",
    sport: "cycling",
    sportLabel: "Cycling",
    shortDescription: "Weekend cycling rides and audax events for all levels in Bangalore.",
    description: "Bangalore Cycling Club (BCC) has been promoting cycling culture in the Garden City since 2009. We organise Sunday morning rides from Cubbon Park, monthly 100km brevets, and annual 200km audax events.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 500,
    lat: 12.9716,
    lng: 77.5946,
    address: "Cubbon Park, Kasturba Road, Bangalore 560001",
    instagramUrl: "https://instagram.com/bangalorecyclingclub",
    websiteUrl: "https://bangalorecyclingclub.in",
    verified: true,
    status: "approved" as const,
    viewCount: 2100,
  },
  {
    name: "Delhi Yoga Collective",
    slug: "delhi-yoga-collective",
    city: "delhi",
    cityLabel: "Delhi",
    sport: "yoga",
    sportLabel: "Yoga",
    shortDescription: "Free outdoor yoga sessions in Delhi's parks every morning.",
    description: "Delhi Yoga Collective brings together yoga practitioners of all levels for free outdoor sessions in Lodhi Garden, India Gate lawns, and Nehru Park. Our sessions are donation-based and open to all.",
    beginnerFriendly: true,
    pricingType: "donation" as const,
    lat: 28.5931,
    lng: 77.2197,
    address: "Lodhi Garden, Lodhi Road, New Delhi 110003",
    instagramUrl: "https://instagram.com/delhiyogacollective",
    verified: true,
    status: "approved" as const,
    viewCount: 650,
  },
  {
    name: "Hyderabad Swimmers",
    slug: "hyderabad-swimmers",
    city: "hyderabad",
    cityLabel: "Hyderabad",
    sport: "swimming",
    sportLabel: "Swimming",
    shortDescription: "Competitive and recreational swimming club at SAI Aquatic Centre.",
    description: "Hyderabad Swimmers is a registered swimming club operating out of the SAI Aquatic Centre in Gachibowli. We offer structured training for competitive swimmers, open-water enthusiasts, and beginners.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 2000,
    lat: 17.4399,
    lng: 78.3489,
    address: "SAI Aquatic Centre, Gachibowli, Hyderabad 500032",
    instagramUrl: "https://instagram.com/hyderabadswimmers",
    verified: false,
    status: "approved" as const,
    viewCount: 430,
  },
  {
    name: "Pune Football Academy",
    slug: "pune-football-academy",
    city: "pune",
    cityLabel: "Pune",
    sport: "football",
    sportLabel: "Football",
    shortDescription: "Grassroots football training for youth and adults in Pune.",
    description: "Pune Football Academy (PFA) provides professional football coaching for players aged 6 to 35. We have certified UEFA-B coaches and operate from the Shree Shiv Chhatrapati Sports Complex.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 1500,
    lat: 18.5204,
    lng: 73.8567,
    address: "Shree Shiv Chhatrapati Sports Complex, Balewadi, Pune 411045",
    instagramUrl: "https://instagram.com/punefootballacademy",
    websiteUrl: "https://punefootball.in",
    verified: true,
    status: "approved" as const,
    viewCount: 780,
  },
  {
    name: "Kolkata Badminton Circle",
    slug: "kolkata-badminton-circle",
    city: "kolkata",
    cityLabel: "Kolkata",
    sport: "badminton",
    sportLabel: "Badminton",
    shortDescription: "Casual and competitive badminton for all skill levels in Kolkata.",
    description: "Kolkata Badminton Circle organises morning and evening sessions at multiple indoor courts across South and North Kolkata. We welcome players of all levels from absolute beginners to state-ranked players.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 800,
    lat: 22.5726,
    lng: 88.3639,
    address: "Netaji Indoor Stadium, Eden Gardens, Kolkata 700021",
    instagramUrl: "https://instagram.com/kolkatabadmintoncircle",
    verified: false,
    status: "approved" as const,
    viewCount: 310,
  },
  {
    name: "Ahmedabad CrossFit Hub",
    slug: "ahmedabad-crossfit-hub",
    city: "ahmedabad",
    cityLabel: "Ahmedabad",
    sport: "crossfit",
    sportLabel: "CrossFit",
    shortDescription: "High-intensity functional fitness community in Ahmedabad.",
    description: "Ahmedabad CrossFit Hub is an affiliate box offering CrossFit classes, Olympic weightlifting, and gymnastics coaching. Our certified coaches design scalable workouts for all fitness levels.",
    beginnerFriendly: false,
    pricingType: "paid" as const,
    monthlyFeeInr: 3500,
    lat: 23.0225,
    lng: 72.5714,
    address: "SG Highway, Bodakdev, Ahmedabad 380054",
    instagramUrl: "https://instagram.com/ahmedabadcrossfithub",
    verified: false,
    status: "pending" as const,
    viewCount: 120,
  },
  {
    name: "Jaipur Tennis Association",
    slug: "jaipur-tennis-association",
    city: "jaipur",
    cityLabel: "Jaipur",
    sport: "tennis",
    sportLabel: "Tennis",
    shortDescription: "Tennis coaching and recreational play at SMS Stadium, Jaipur.",
    description: "Jaipur Tennis Association provides professional tennis coaching and facilitates recreational matches at the SMS Stadium courts. We have AITA-certified coaches for junior development, adult beginners, and competitive players.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 2500,
    lat: 26.9124,
    lng: 75.7873,
    address: "SMS Stadium, Bhawani Singh Road, Jaipur 302001",
    instagramUrl: "https://instagram.com/jaipurtennisassociation",
    verified: false,
    status: "approved" as const,
    viewCount: 260,
  },
  {
    name: "Goa Surf Club",
    slug: "goa-surf-club",
    city: "goa",
    cityLabel: "Goa",
    sport: "surfing",
    sportLabel: "Surfing",
    shortDescription: "India's premier surf community based on the beaches of North Goa.",
    description: "Goa Surf Club is the oldest surf community in India, operating since 2005 from Vagator Beach. We offer beginner surf lessons, intermediate coaching, and advanced performance training.",
    beginnerFriendly: true,
    pricingType: "paid" as const,
    monthlyFeeInr: 4000,
    lat: 15.5957,
    lng: 73.7444,
    address: "Vagator Beach, North Goa 403509",
    instagramUrl: "https://instagram.com/goasurfclub",
    websiteUrl: "https://goasurfclub.in",
    verified: true,
    status: "approved" as const,
    viewCount: 1850,
  },
];

const SESSIONS_DATA = [
  { clubSlug: "chennai-runners", dayOfWeek: 0, startTime: "06:00", endTime: "08:00", locationName: "Marina Beach Promenade" },
  { clubSlug: "chennai-runners", dayOfWeek: 3, startTime: "06:30", endTime: "08:00", locationName: "Nungambakkam Track" },
  { clubSlug: "mumbai-trail-blazers", dayOfWeek: 6, startTime: "05:30", endTime: "10:00", locationName: "SGNP Entry Gate" },
  { clubSlug: "bangalore-cycling-club", dayOfWeek: 0, startTime: "06:00", endTime: "10:00", locationName: "Cubbon Park" },
  { clubSlug: "delhi-yoga-collective", dayOfWeek: 1, startTime: "06:30", endTime: "07:30", locationName: "Lodhi Garden" },
  { clubSlug: "delhi-yoga-collective", dayOfWeek: 3, startTime: "06:30", endTime: "07:30", locationName: "India Gate Lawns" },
  { clubSlug: "delhi-yoga-collective", dayOfWeek: 6, startTime: "07:00", endTime: "08:30", locationName: "Nehru Park" },
  { clubSlug: "hyderabad-swimmers", dayOfWeek: 1, startTime: "05:30", endTime: "07:00", locationName: "SAI Aquatic Centre" },
  { clubSlug: "hyderabad-swimmers", dayOfWeek: 3, startTime: "05:30", endTime: "07:00", locationName: "SAI Aquatic Centre" },
  { clubSlug: "hyderabad-swimmers", dayOfWeek: 5, startTime: "05:30", endTime: "07:00", locationName: "SAI Aquatic Centre" },
  { clubSlug: "pune-football-academy", dayOfWeek: 2, startTime: "17:00", endTime: "19:00", locationName: "Balewadi Stadium" },
  { clubSlug: "pune-football-academy", dayOfWeek: 5, startTime: "17:00", endTime: "19:00", locationName: "Balewadi Stadium" },
  { clubSlug: "goa-surf-club", dayOfWeek: 6, startTime: "07:00", endTime: "10:00", locationName: "Vagator Beach" },
  { clubSlug: "goa-surf-club", dayOfWeek: 0, startTime: "07:00", endTime: "10:00", locationName: "Vagator Beach" },
];

const now = Date.now();
const EVENTS_DATA = [
  {
    clubSlug: "chennai-runners",
    title: "Chennai Half Marathon Prep Run",
    description: "A 21km training run along the ECR to prepare for the upcoming Chennai Marathon.",
    datetimeUtc: new Date(now + 7 * 24 * 60 * 60 * 1000),
    isOpen: true,
    locationName: "Elliot's Beach, Besant Nagar",
  },
  {
    clubSlug: "bangalore-cycling-club",
    title: "Nandi Hills Sunrise Ride",
    description: "100km round trip to Nandi Hills. Start at 4:30am from Cubbon Park.",
    datetimeUtc: new Date(now + 14 * 24 * 60 * 60 * 1000),
    isOpen: true,
    locationName: "Cubbon Park, Bangalore",
  },
  {
    clubSlug: "mumbai-trail-blazers",
    title: "Sahyadri Night Trail",
    description: "A 25km night trail through the Sahyadri ranges. Headlamps mandatory.",
    datetimeUtc: new Date(now + 21 * 24 * 60 * 60 * 1000),
    isOpen: false,
    locationName: "Karjat, Maharashtra",
  },
  {
    clubSlug: "goa-surf-club",
    title: "Goa Surf Open 2026",
    description: "Annual open surf competition at Vagator Beach. All levels welcome.",
    datetimeUtc: new Date(now + 30 * 24 * 60 * 60 * 1000),
    isOpen: true,
    locationName: "Vagator Beach, North Goa",
  },
  {
    clubSlug: "delhi-yoga-collective",
    title: "International Yoga Day Celebration",
    description: "Special sunrise session at India Gate with 500+ participants.",
    datetimeUtc: new Date(now + 10 * 24 * 60 * 60 * 1000),
    isOpen: true,
    locationName: "India Gate, New Delhi",
  },
];

console.log("🌱 Seeding database...\n");

// Insert clubs
const insertedClubs: Array<typeof clubs.$inferSelect> = [];
for (const club of CLUBS) {
  try {
    await db.insert(clubs).values({
      ...club,
      instagramUrl: club.instagramUrl ?? null,
      whatsappUrl: (club as any).whatsappUrl ?? null,
      websiteUrl: (club as any).websiteUrl ?? null,
      monthlyFeeInr: (club as any).monthlyFeeInr ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({ target: clubs.slug, set: { name: club.name } });
    const [row] = await db.select().from(clubs).where(eq(clubs.slug, club.slug)).limit(1);
    if (row) insertedClubs.push(row);
    console.log(`  ✓ Club: ${club.name}`);
  } catch (err: any) {
    console.warn(`  ⚠ Skipped ${club.name}: ${err.message}`);
  }
}

// Insert sessions
console.log("\n📅 Sessions:");
for (const session of SESSIONS_DATA) {
  const club = insertedClubs.find((c) => c.slug === session.clubSlug);
  if (!club) continue;
  try {
    await db.insert(sessions).values({
      clubId: club.id,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime ?? null,
      locationName: session.locationName ?? null,
      lat: null,
      lng: null,
      notes: null,
    });
    console.log(`  ✓ ${session.clubSlug} — ${session.startTime}`);
  } catch (err: any) {
    console.warn(`  ⚠ Skipped: ${err.message}`);
  }
}

// Insert events
console.log("\n🎉 Events:");
for (const event of EVENTS_DATA) {
  const club = insertedClubs.find((c) => c.slug === event.clubSlug);
  if (!club) continue;
  try {
    await db.insert(events).values({
      clubId: club.id,
      title: event.title,
      description: event.description ?? null,
      datetimeUtc: event.datetimeUtc,
      isOpen: event.isOpen,
      locationName: event.locationName ?? null,
      lat: null,
      lng: null,
      registrationUrl: null,
      maxParticipants: null,
    });
    console.log(`  ✓ ${event.title}`);
  } catch (err: any) {
    console.warn(`  ⚠ Skipped: ${err.message}`);
  }
}

console.log("\n✅ Seed complete!");
await connection.end();
