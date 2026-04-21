import { getDb } from "../server/db";
import { clubs, sessions, events } from "../drizzle/schema";

const CHENNAI_CLUBS = [
  {
    name: "Cloka",
    slug: "cloka",
    description: "A vibrant running community in Chennai focused on building endurance and camaraderie.",
    shortDescription: "Running community for all levels",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Pace and Blaze",
    slug: "pace-and-blaze",
    description: "High-energy running club dedicated to speed training and competitive running.",
    shortDescription: "Speed-focused running club",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Vamos",
    slug: "vamos",
    description: "Vamos brings together runners of all abilities for weekly training sessions.",
    shortDescription: "Inclusive running community",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Voko",
    slug: "voko",
    description: "A running club focused on trail running and outdoor adventures.",
    shortDescription: "Trail running and outdoor adventures",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Styd",
    slug: "styd",
    description: "Styd is a running club for marathon enthusiasts and long-distance runners.",
    shortDescription: "Marathon and long-distance running",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Batclub",
    slug: "batclub",
    description: "A fun and social running club with a focus on community building.",
    shortDescription: "Social running community",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Project Vanta",
    slug: "project-vanta",
    description: "Project Vanta is a running initiative for fitness enthusiasts of all levels.",
    shortDescription: "Fitness-focused running initiative",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Vault Club",
    slug: "vault-club",
    description: "Vault Club offers structured training programs for runners.",
    shortDescription: "Structured running training programs",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Fitrx",
    slug: "fitrx",
    description: "Fitrx combines running with fitness training for holistic wellness.",
    shortDescription: "Running and fitness combined",
    lat: 13.0827,
    lng: 80.2707,
    address: "Chennai, Tamil Nadu",
  },
];

async function seedChennaiClubs() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    console.log("Seeding 9 Chennai running clubs...");

    for (const clubData of CHENNAI_CLUBS) {
      // Insert club
      await db.insert(clubs).values({
        slug: clubData.slug,
        name: clubData.name,
        city: "chennai",
        cityLabel: "Chennai",
        sport: "running",
        sportLabel: "Running",
        description: clubData.description,
        shortDescription: clubData.shortDescription,
        status: "approved",
        verified: true,
        beginnerFriendly: true,
        pricingType: "free",
        lat: clubData.lat,
        lng: clubData.lng,
        address: clubData.address,
        instagramUrl: `https://instagram.com/${clubData.slug}`,
        whatsappUrl: `https://chat.whatsapp.com/${clubData.slug}`,
        submittedBy: 1,
        ownedBy: 1,
      });

      // Get the inserted club ID
      const [insertedClub] = await db
        .select({ id: clubs.id })
        .from(clubs)
        .where(clubs.slug === clubData.slug);

      if (insertedClub) {
        // Add weekly sessions
        const sessionDays = [2, 4, 6]; // Mon, Wed, Fri
        for (const day of sessionDays) {
          await db.insert(sessions).values({
            clubId: insertedClub.id,
            dayOfWeek: day,
            startTime: "06:00",
            endTime: "07:30",
            locationName: `${clubData.name} Training Ground`,
            lat: clubData.lat,
            lng: clubData.lng,
            notes: "Morning run session",
          });
        }

        // Add upcoming events
        const now = new Date();
        const eventDates = [
          new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        ];

        for (let i = 0; i < eventDates.length; i++) {
          const eventDate = eventDates[i];
          eventDate.setHours(6, 0, 0, 0);

          await db.insert(events).values({
            clubId: insertedClub.id,
            title: `${clubData.name} Weekly Run ${i + 1}`,
            description: `Join us for an exciting running session at ${clubData.name}. All levels welcome!`,
            datetimeUtc: eventDate,
            isOpen: true,
            locationName: `${clubData.name} Training Ground`,
            maxParticipants: 50,
          });
        }

        console.log(`✓ Added ${clubData.name} with 3 sessions and 2 events`);
      }
    }

    console.log("\n✅ Successfully seeded 9 Chennai running clubs with sessions and events!");
  } catch (error) {
    console.error("Error seeding clubs:", error);
    throw error;
  }
}

seedChennaiClubs();
