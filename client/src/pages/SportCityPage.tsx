import { trpc } from "@/lib/trpc";
import { CITIES, SPORTS } from "../../../shared/constants";
import { BadgeCheck, MapPin } from "lucide-react";
import { Link } from "wouter";
import ClubCard from "../components/clubs/ClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import EmptyState from "../components/clubs/EmptyState";
import Pagination from "../components/clubs/Pagination";
import { useState } from "react";

interface SportCityPageProps {
  params: { city: string; sportSlug: string };
}

export default function SportCityPage({ params }: SportCityPageProps) {
  const { city: cityKey, sportSlug } = params;
  // sportSlug is like "running-clubs" → extract "running"
  const sportKey = sportSlug.replace(/-clubs$/, "");

  const cityInfo = CITIES.find((c) => c.key === cityKey);
  const sportInfo = SPORTS.find((s) => s.key === sportKey);
  const cityLabel = cityInfo?.label ?? cityKey;
  const sportLabel = sportInfo?.label ?? sportKey;

  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.clubs.list.useQuery({
    city: cityKey,
    sport: sportKey,
    page,
    limit: 12,
  });

  const pageTitle = `${sportLabel} Clubs in ${cityLabel}`;

  return (
    <div className="min-h-screen bg-background">
      {/* SEO-friendly header */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-12">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">India</Link>
            <span>/</span>
            <Link href={`/india/${cityKey}`} className="hover:text-foreground transition-colors">{cityLabel}</Link>
            <span>/</span>
            <span className="text-foreground">{sportLabel} Clubs</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="text-4xl">{sportInfo?.emoji ?? "🏅"}</div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {cityLabel}, India
                {data && (
                  <span className="ml-2 text-foreground font-medium">
                    · {data.total} club{data.total !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10">
        {/* Other sports in this city */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SPORTS.filter((s) => s.key !== sportKey).slice(0, 6).map((sport) => (
            <Link
              key={sport.key}
              href={`/india/${cityKey}/${sport.key}-clubs`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${sport.color}`}
            >
              {sport.emoji} {sport.label}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <ClubGridSkeleton count={12} />
        ) : data?.clubs.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
            <Pagination
              page={page}
              total={data.total}
              limit={12}
              onPageChange={setPage}
              className="mt-10"
            />
          </>
        ) : (
          <EmptyState
            title={`No ${sportLabel} clubs in ${cityLabel} yet`}
            description={`Be the first to add a ${sportLabel.toLowerCase()} club in ${cityLabel}.`}
            action={{ label: "Add Your Club", href: "/submit" }}
          />
        )}
      </div>
    </div>
  );
}
