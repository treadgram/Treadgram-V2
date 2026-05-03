import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DirectoryClubCard from "../components/clubs/DirectoryClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import FilterPanel, { type FilterState } from "../components/clubs/FilterPanel";
import Pagination from "../components/clubs/Pagination";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SlidersHorizontal, X } from "lucide-react";
import { CITIES, SPORTS } from "../../../shared/constants";
import { Link } from "wouter";

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

function resolveCityKey(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return "";
  const byKey = CITIES.find((c) => c.key === t);
  if (byKey) return byKey.key;
  const byLabel = CITIES.find((c) => c.label.toLowerCase() === t);
  return byLabel?.key ?? "";
}

export default function Explore() {
  const [location, navigate] = useLocation();
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
  const [barSearch, setBarSearch] = useState("");
  const [barCity, setBarCity] = useState("");

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setBarSearch(filters.search);
    const cityLabel = filters.city ? CITIES.find((c) => c.key === filters.city)?.label : "";
    setBarCity(cityLabel ?? "");
  }, [filters.search, filters.city]);

  useEffect(() => {
    const qs = typeof window !== "undefined" ? window.location.search : "";
    setFilters((prev) => ({ ...prev, ...parseSearchParams(qs) }));
  }, [location]);

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

  const runBarSearch = () => {
    const rawCity = barCity.trim();
    let cityKey = resolveCityKey(rawCity);
    if (!cityKey && rawCity) {
      const fuzzy = CITIES.find(
        (c) =>
          c.label.toLowerCase().includes(rawCity.toLowerCase()) ||
          c.key.includes(rawCity.toLowerCase())
      );
      cityKey = fuzzy?.key ?? "";
    }
    const next: FilterState = {
      ...filters,
      search: barSearch.trim(),
      city: cityKey,
    };
    setFilters(next);
    setPage(1);
    const p = new URLSearchParams();
    if (next.search) p.set("search", next.search);
    if (next.city) p.set("city", next.city);
    if (next.sport) p.set("sport", next.sport);
    if (next.pricingType) p.set("pricing", next.pricingType);
    if (next.beginnerFriendly) p.set("beginner", "true");
    if (next.verified) p.set("verified", "true");
    const qs = p.toString();
    navigate(qs ? `/explore?${qs}` : "/explore");
  };

  const hasSidebarFilters =
    filters.sport || filters.pricingType || filters.beginnerFriendly || filters.verified;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label mb-3">// Directory</p>
              <h1 className="font-display text-[clamp(3rem,12vw,6rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white">
                Clubs
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#aaaaaa]">
                Find your crew. Join local clubs or start your own.
              </p>
              {(cityLabel || sportLabel) && (
                <p className="mt-2 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
                  {[cityLabel, sportLabel].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
            <Button size="lg" className="h-12 w-full shrink-0 lg:w-auto" asChild>
              <Link href="/submit">Launch your club</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <Input
              placeholder="Search clubs..."
              value={barSearch}
              onChange={(e) => setBarSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runBarSearch())}
              className="h-12 rounded-none border border-[#333] bg-[#1a1a1a] text-[15px] text-white placeholder:text-[#666]"
            />
            <Input
              placeholder="City"
              value={barCity}
              onChange={(e) => setBarCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runBarSearch())}
              className="h-12 rounded-none border border-[#333] bg-[#1a1a1a] text-[15px] text-white placeholder:text-[#666] sm:max-w-[200px]"
            />
            <Button type="button" className="h-12 shrink-0 px-8 sm:w-40" onClick={runBarSearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-28">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="gap-2 border-white"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {hasSidebarFilters && (
                  <span className="flex size-5 items-center justify-center bg-primary font-display text-[10px] font-black text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </div>

            {showMobileFilters && (
              <div className="mb-6 lg:hidden">
                <FilterPanel filters={filters} onChange={setFilters} />
              </div>
            )}

            {(filters.city || filters.sport || filters.pricingType || filters.beginnerFriendly || filters.verified) && (
              <div className="mb-5 flex flex-wrap gap-2">
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
                  <Chip label="Beginner friendly" onRemove={() => setFilters({ ...filters, beginnerFriendly: false })} />
                )}
                {filters.verified && (
                  <Chip label="Verified only" onRemove={() => setFilters({ ...filters, verified: false })} />
                )}
              </div>
            )}

            {isLoading || isFetching ? (
              <ClubGridSkeleton count={12} />
            ) : data?.clubs.length ? (
              <>
                <div className="flex flex-col gap-4">
                  {data.clubs.map((club) => (
                    <DirectoryClubCard key={club.id} club={club} />
                  ))}
                </div>
                <Pagination page={page} total={data.total} limit={12} onPageChange={setPage} className="mt-10" />
              </>
            ) : (
              <div className="mx-auto flex max-w-lg flex-col items-center border border-[#222] bg-[#141414] px-8 py-16 text-center">
                <h2 className="font-display text-[40px] font-black uppercase leading-none tracking-[-0.02em] text-white">
                  No clubs yet.
                </h2>
                <p className="mt-4 text-[16px] text-[#aaaaaa]">Be the first to launch one in your city.</p>
                <Button className="mt-8 h-12 px-10" asChild>
                  <Link href="/submit">Create club</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
      {label}
      <button type="button" onClick={onRemove} className="transition-colors hover:text-foreground">
        <X className="size-3.5" />
      </button>
    </span>
  );
}
