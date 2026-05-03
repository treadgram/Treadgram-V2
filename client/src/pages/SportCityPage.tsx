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

  return (
    <div className="min-h-screen bg-background">
      {/* SEO-friendly header */}
      <div className="border-b border-[#1a1a1a] bg-[#111111] py-16 md:py-24">
        <div className="container">
          <nav className="mb-4 flex flex-wrap items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            <Link href="/" className="transition-colors hover:text-primary">
              India
            </Link>
            <span>/</span>
            <Link href={`/india/${cityKey}`} className="transition-colors hover:text-primary">
              {cityLabel}
            </Link>
            <span>/</span>
            <span className="text-foreground">{sportLabel} clubs</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="text-4xl leading-none">{sportInfo?.emoji ?? "🏅"}</div>
            <div>
              <p className="section-label mb-2">// Sport + city</p>
              <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground sm:text-5xl">
                <span className="text-primary">{sportLabel}</span> clubs in {cityLabel}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[15px] text-[#aaaaaa]">
                <MapPin className="size-4 shrink-0 text-primary" />
                {cityLabel}, India
                {data && (
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                    · {data.total} club{data.total !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 md:py-20">
        <p className="section-label mb-3">// Other sports</p>
        <div className="mb-10 flex flex-wrap gap-2">
          {SPORTS.filter((s) => s.key !== sportKey)
            .slice(0, 6)
            .map((sport) => (
              <Link
                key={sport.key}
                href={`/india/${cityKey}/${sport.key}-clubs`}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-[filter,border-color] hover:border-primary ${sport.color}`}
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
