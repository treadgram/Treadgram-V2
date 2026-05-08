import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Banknote, Calendar, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const HERO_BG =
  "https://images.unsplash.com/photo-1461896836934-ffe607821721?auto=format&fit=crop&w=2400&q=80";

function extractDistanceTag(title: string): string {
  const m = title.match(/(\d+)\s*(km|KM|k)\b/i);
  if (m) return `${m[1]} KM`;
  return "ANY DIST";
}

function entryPriceLabel(
  pricingType: string,
  monthlyFeeInr: number | null
): { headline: string; sub: string } {
  if (pricingType === "free") return { headline: "FREE", sub: "No entry fee" };
  if (pricingType === "donation") return { headline: "PAY WHAT YOU CAN", sub: "Suggested support" };
  const n = monthlyFeeInr ?? 100;
  return { headline: `₹${n}`, sub: "Per signup" };
}

interface Props {
  params: { id: string };
}

export default function EventDetail({ params }: Props) {
  const id = Number.parseInt(params.id, 10);
  const validId = Number.isFinite(id) && id > 0;

  const { data: row, isLoading, error } = trpc.events.byId.useQuery(
    { id },
    { enabled: validId, retry: false }
  );

  if (!validId) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-lg uppercase text-[#888888]">Invalid event</p>
        <Button asChild className="mt-6">
          <Link href="/events">All events</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Skeleton className="h-[min(70vh,520px)] w-full rounded-none" />
        <div className="container py-12">
          <Skeleton className="h-40 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-lg uppercase text-[#888888]">Event not found</p>
        <Button asChild className="mt-6">
          <Link href="/events">All events</Link>
        </Button>
      </div>
    );
  }

  const dt = new Date(row.datetimeUtc);
  const dateStr = dt.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const titleUpper = row.title.toUpperCase();
  const subtitle =
    row.description?.trim().split("\n")[0]?.slice(0, 120) ||
    `${row.clubName} · ${row.clubCityLabel}`;
  const pillPublic = row.isOpen ? "PUBLIC" : "MEMBERS";
  const pillDist = extractDistanceTag(row.title);
  const pillAny = "ANY";
  const price = entryPriceLabel(row.pricingType, row.monthlyFeeInr);
  const spots =
    row.maxParticipants != null
      ? `${row.maxParticipants} spots max`
      : "Open capacity — register early";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative min-h-[min(78vh,560px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${row.clubCoverImageUrl ?? HERO_BG})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden />

        <div className="relative z-10 flex min-h-[min(78vh,560px)] flex-col">
          <div className="container pt-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:text-primary"
            >
              ← All events
            </Link>
          </div>

          <div className="container mt-auto flex flex-1 flex-col justify-end pb-10 md:pb-14">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="bg-primary px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                {pillPublic}
              </span>
              <span className="border border-white bg-black/50 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                {pillDist}
              </span>
              <span className="border border-white bg-black/50 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                {pillAny}
              </span>
            </div>
            <h1 className="max-w-5xl font-display text-[clamp(2.5rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-white">
              {titleUpper}
            </h1>
            <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-[#aaaaaa]">{subtitle}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#222] bg-[#0a0a0a] py-14 md:py-20">
        <div className="container">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-px border border-[#222] bg-[#222] sm:grid-cols-2">
                <InfoCell
                  icon={<Calendar className="size-5 text-primary" />}
                  label="DATE & TIME"
                  value={`${dateStr} at ${timeStr}`}
                />
                <InfoCell
                  icon={<MapPin className="size-5 text-primary" />}
                  label="LOCATION"
                  value={row.area ? `${row.locationName || row.clubCityLabel}, ${row.area}` : (row.locationName || row.clubCityLabel)}
                />
                <InfoCell
                  icon={<Users className="size-5 text-primary" />}
                  label="HOST"
                  value={row.clubName}
                />
                <InfoCell
                  icon={<Banknote className="size-5 text-primary" />}
                  label="ENTRY"
                  value={price.headline === "FREE" ? "Free entry" : price.headline}
                />
              </div>
            </div>

            <aside className="w-full shrink-0 border border-[#2a2a2a] bg-[#141414] p-6 lg:w-[280px]">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[#888888]">ENTRY</p>
              <p className="mt-2 break-words font-display text-[clamp(2rem,5vw,3.75rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
                {price.headline}
              </p>
              <p className="mt-4 text-[13px] text-[#888888]">{spots}</p>
              {row.registrationUrl ? (
                <a href={row.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-6 block">
                  <Button className="h-[52px] w-full text-[13px]">Pay & register</Button>
                </a>
              ) : (
                <Button className="mt-6 h-[52px] w-full text-[13px]" asChild>
                  <a href={getLoginUrl()}>Pay & register</a>
                </Button>
              )}
              <p className="mt-3 text-center text-[11px] text-[#666666]">You&apos;ll need to log in first</p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#0a0a0a] p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2">{icon}</div>
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[#888888]">{label}</p>
      <p className="mt-2 text-[17px] font-medium leading-snug text-white">{value}</p>
    </div>
  );
}
