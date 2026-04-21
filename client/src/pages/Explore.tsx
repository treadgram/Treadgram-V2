import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ClubCard from "../components/clubs/ClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import EmptyState from "../components/clubs/EmptyState";
import FilterPanel, { type FilterState } from "../components/clubs/FilterPanel";
import Pagination from "../components/clubs/Pagination";
import { Button } from "../components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITIES, SPORTS } from "../../../shared/constants";

function parseSearchParams(search: string): Partial<FilterState> {
  const params = new URLSearchParams(search);
  return {
    search: params.get("search") ?? "",
    city: params.get("city") ?? "",
    sport: params.get("sport") ?? "",
    pricingType: params.get("pricing") ?? "",
    beginnerFriendly: params.get("beginner") === "true",
    verified: params.get("verified") === "true",
  };
}

export default function Explore() {
  const [location] = useLocation();
  const searchString = typeof window !== "undefined" ? window.location.search : "";

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    city: "",
    sport: "",
    pricingType: "",
    beginnerFriendly: false,
    verified: false,
    ...parseSearchParams(searchString),
  });
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters]);

  const { data, isLoading, isFetching } = trpc.clubs.list.useQuery({
    search: filters.search || undefined,
    city: filters.city || undefined,
    sport: filters.sport || undefined,
    pricingType: (filters.pricingType as "free" | "paid" | "donation") || undefined,
    beginnerFriendly: filters.beginnerFriendly || undefined,
    verified: filters.verified || undefined,
    page,
    limit: 12,
  });

  const cityLabel = filters.city ? CITIES.find((c) => c.key === filters.city)?.label : null;
  const sportLabel = filters.sport ? SPORTS.find((s) => s.key === filters.sport)?.label : null;

  const pageTitle = [cityLabel, sportLabel ? `${sportLabel} Clubs` : null]
    .filter(Boolean)
    .join(" — ") || "Explore Sports Clubs";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} club${data.total !== 1 ? "s" : ""} found` : "Searching..."}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter toggle */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(filters.city || filters.sport || filters.pricingType || filters.beginnerFriendly || filters.verified) && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile filters panel */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <FilterPanel filters={filters} onChange={setFilters} />
              </div>
            )}

            {/* Active filter chips */}
            {(filters.city || filters.sport || filters.pricingType || filters.beginnerFriendly || filters.verified) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.city && (
                  <Chip label={cityLabel ?? filters.city} onRemove={() => setFilters({ ...filters, city: "" })} />
                )}
                {filters.sport && (
                  <Chip label={sportLabel ?? filters.sport} onRemove={() => setFilters({ ...filters, sport: "" })} />
                )}
                {filters.pricingType && (
                  <Chip label={filters.pricingType} onRemove={() => setFilters({ ...filters, pricingType: "" })} />
                )}
                {filters.beginnerFriendly && (
                  <Chip label="Beginner Friendly" onRemove={() => setFilters({ ...filters, beginnerFriendly: false })} />
                )}
                {filters.verified && (
                  <Chip label="Verified Only" onRemove={() => setFilters({ ...filters, verified: false })} />
                )}
              </div>
            )}

            {/* Results */}
            {isLoading || isFetching ? (
              <ClubGridSkeleton count={12} />
            ) : data?.clubs.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                title="No clubs found"
                description="Try adjusting your filters or be the first to add a club in this area."
                action={{ label: "Add Your Club", href: "/submit" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-primary/70 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}
