// ─── Cities ───────────────────────────────────────────────────────────────────

export const CITIES = [
  { key: "mumbai", label: "Mumbai", state: "Maharashtra" },
  { key: "delhi", label: "Delhi", state: "Delhi" },
  { key: "bangalore", label: "Bangalore", state: "Karnataka" },
  { key: "chennai", label: "Chennai", state: "Tamil Nadu" },
  { key: "hyderabad", label: "Hyderabad", state: "Telangana" },
  { key: "pune", label: "Pune", state: "Maharashtra" },
  { key: "kolkata", label: "Kolkata", state: "West Bengal" },
  { key: "ahmedabad", label: "Ahmedabad", state: "Gujarat" },
  { key: "jaipur", label: "Jaipur", state: "Rajasthan" },
  { key: "kochi", label: "Kochi", state: "Kerala" },
  { key: "chandigarh", label: "Chandigarh", state: "Punjab" },
  { key: "goa", label: "Goa", state: "Goa" },
] as const;

export type CityKey = (typeof CITIES)[number]["key"];

// ─── Sports ───────────────────────────────────────────────────────────────────

export const SPORTS = [
  { key: "running", label: "Running", emoji: "🏃", color: "bg-orange-100 text-orange-700" },
  { key: "cycling", label: "Cycling", emoji: "🚴", color: "bg-blue-100 text-blue-700" },
  { key: "yoga", label: "Yoga", emoji: "🧘", color: "bg-purple-100 text-purple-700" },
  { key: "badminton", label: "Badminton", emoji: "🏸", color: "bg-red-100 text-red-700" },
  { key: "pickleball", label: "Pickleball", emoji: "🎾", color: "bg-lime-100 text-lime-700" },
  { key: "tennis", label: "Tennis", emoji: "🎾", color: "bg-yellow-100 text-yellow-700" },
  { key: "basketball", label: "Basketball", emoji: "🏀", color: "bg-amber-100 text-amber-700" },
  { key: "hiking", label: "Hiking", emoji: "🥾", color: "bg-stone-100 text-stone-700" },
  { key: "martial-arts", label: "Martial Arts", emoji: "🥋", color: "bg-rose-100 text-rose-700" },
  { key: "fitness", label: "Fitness", emoji: "💪", color: "bg-indigo-100 text-indigo-700" },
] as const;

export type SportKey = (typeof SPORTS)[number]["key"];

// ─── Days of week ─────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// ─── Pricing types ────────────────────────────────────────────────────────────

export const PRICING_LABELS: Record<string, string> = {
  free: "Free",
  paid: "Paid",
  donation: "Donation-based",
};

// ─── URL helpers ──────────────────────────────────────────────────────────────

export function getCityPath(city: string) {
  return `/india/${city}`;
}

export function getSportPath(city: string, sport: string) {
  return `/india/${city}/${sport}-clubs`;
}

export function getClubPath(slug: string) {
  return `/clubs/${slug}`;
}

export function getSportLabel(key: string) {
  return SPORTS.find((s) => s.key === key)?.label ?? key;
}

export function getSportEmoji(key: string) {
  return SPORTS.find((s) => s.key === key)?.emoji ?? "🏅";
}

export function getSportColor(key: string) {
  return SPORTS.find((s) => s.key === key)?.color ?? "bg-gray-100 text-gray-700";
}

export function getCityLabel(key: string) {
  return CITIES.find((c) => c.key === key)?.label ?? key;
}
