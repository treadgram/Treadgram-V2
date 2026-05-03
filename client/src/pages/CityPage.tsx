import { trpc } from "@/lib/trpc";
import { CITIES, SPORTS } from "../../../shared/constants";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import ClubCard from "../components/clubs/ClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import EmptyState from "../components/clubs/EmptyState";
import { Button } from "../components/ui/button";

interface CityPageProps {
  params: { city: string };
}

export default function CityPage({ params }: CityPageProps) {
  const cityKey = params.city;
  const cityInfo = CITIES.find((c) => c.key === cityKey);
  const cityLabel = cityInfo?.label ?? cityKey;

  const { data, isLoading } = trpc.clubs.list.useQuery({
    city: cityKey,
    page: 1,
    limit: 8,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#111111] py-16 md:py-24">
        <div className="container">
          <div className="mb-4 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/explore" className="transition-colors hover:text-primary">
              Explore
            </Link>
            <span>/</span>
            <span className="text-foreground">{cityLabel}</span>
          </div>
          <p className="section-label mb-3">// City</p>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center border border-primary/40 bg-[#0a0a0a]">
              <MapPin className="size-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground sm:text-5xl">
              Sports clubs in <span className="text-primary">{cityLabel}</span>
            </h1>
          </div>
          {cityInfo && <p className="mt-4 text-[15px] text-[#aaaaaa]">{cityInfo.state}, India</p>}
        </div>
      </div>

      {/* Sports grid for this city */}
      <section className="border-b border-[#1a1a1a] py-16 md:py-20">
        <div className="container">
          <p className="section-label mb-3">// Sports</p>
          <h2 className="font-display text-2xl font-black uppercase tracking-[-0.02em] text-foreground md:text-3xl">
            Browse by sport in {cityLabel}
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {SPORTS.map((sport) => (
              <Link
                key={sport.key}
                href={`/india/${cityKey}/${sport.key}-clubs`}
                className={`inline-flex items-center gap-2 border px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-[filter,border-color] hover:border-primary ${sport.color}`}
              >
                {sport.emoji} {sport.label} clubs
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All clubs in city */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-3">// Directory</p>
              <h2 className="font-display text-2xl font-black uppercase tracking-[-0.02em] text-foreground md:text-3xl">
                All clubs in {cityLabel}
                {data && (
                  <span className="ml-2 font-display text-lg font-bold text-[#888888]">({data.total})</span>
                )}
              </h2>
            </div>
            <Button variant="outline" asChild className="w-fit border-white">
              <Link href={`/explore?city=${cityKey}`} className="gap-1.5">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <ClubGridSkeleton count={8} />
          ) : data?.clubs.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No clubs in ${cityLabel} yet`}
              description="Be the first to add a sports club in this city."
              action={{ label: "Add a Club", href: "/submit" }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
