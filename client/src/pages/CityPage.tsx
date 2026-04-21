import { trpc } from "@/lib/trpc";
import { CITIES, SPORTS, getSportEmoji, getSportColor } from "../../../shared/constants";
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
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-12">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <span>/</span>
            <span className="text-foreground">{cityLabel}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Sports Clubs in {cityLabel}
            </h1>
          </div>
          {cityInfo && (
            <p className="text-muted-foreground">{cityInfo.state}, India</p>
          )}
        </div>
      </div>

      {/* Sports grid for this city */}
      <section className="py-10 border-b border-border">
        <div className="container">
          <h2 className="font-display text-xl font-semibold text-foreground mb-5">
            Browse by Sport in {cityLabel}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {SPORTS.map((sport) => (
              <Link
                key={sport.key}
                href={`/india/${cityKey}/${sport.key}-clubs`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 ${sport.color}`}
              >
                {sport.emoji} {sport.label} Clubs
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All clubs in city */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              All Clubs in {cityLabel}
              {data && <span className="text-muted-foreground font-normal text-base ml-2">({data.total})</span>}
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/explore?city=${cityKey}`} className="gap-1.5">
                View all <ArrowRight className="w-4 h-4" />
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
