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
  { key: "running", label: "Running", emoji: "🏃", color: "bg-[#181818] text-orange-400 border border-orange-900/60" },
  { key: "cycling", label: "Cycling", emoji: "🚴", color: "bg-[#181818] text-sky-400 border border-sky-900/60" },
  { key: "yoga", label: "Yoga", emoji: "🧘", color: "bg-[#181818] text-violet-400 border border-violet-900/60" },
  { key: "badminton", label: "Badminton", emoji: "🏸", color: "bg-[#181818] text-red-400 border border-red-900/60" },
  { key: "pickleball", label: "Pickleball", emoji: "🎾", color: "bg-[#181818] text-lime-400 border border-lime-900/60" },
  { key: "tennis", label: "Tennis", emoji: "🎾", color: "bg-[#181818] text-yellow-400 border border-yellow-900/60" },
  { key: "basketball", label: "Basketball", emoji: "🏀", color: "bg-[#181818] text-amber-400 border border-amber-900/60" },
  { key: "hiking", label: "Hiking", emoji: "🥾", color: "bg-[#181818] text-stone-400 border border-stone-700" },
  { key: "martial-arts", label: "Martial Arts", emoji: "🥋", color: "bg-[#181818] text-rose-400 border border-rose-900/60" },
  { key: "fitness", label: "Fitness", emoji: "💪", color: "bg-[#181818] text-indigo-400 border border-indigo-900/60" },
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
  return SPORTS.find((s) => s.key === key)?.color ?? "bg-[#181818] text-[#aaaaaa] border border-[#333]";
}

export function getCityLabel(key: string) {
  return CITIES.find((c) => c.key === key)?.label ?? key;
}
