import { trpc } from "@/lib/trpc";
import { CITIES, SPORTS, getSportPath } from "../../../shared/constants";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Plus,
  Search,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import ClubCard from "../components/clubs/ClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import EmptyState from "../components/clubs/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Home() {
  const [, navigate] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const { data: stats } = trpc.clubs.stats.useQuery();
  const { data: featuredData, isLoading: loadingFeatured } = trpc.clubs.list.useQuery({
    verified: true,
    page: 1,
    limit: 8,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const featuredCities = CITIES.slice(0, 8);
  const featuredSports = SPORTS.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-16 pb-20">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap className="w-3.5 h-3.5" />
              TreadGram — Your Sports Tribe
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Perfect Club
              </span>{" "}
              Across India
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Discover running clubs, cycling groups, yoga studios, football teams, and more sports communities in your city. Join, connect, and train together.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search clubs, cities, sports..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12 text-base shadow-sm"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 shadow-sm">
                Search
              </Button>
            </form>

            {/* Quick sport pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {featuredSports.slice(0, 6).map((sport) => (
                <Link
                  key={sport.key}
                  href={`/explore?sport=${sport.key}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${sport.color}`}
                >
                  {sport.emoji} {sport.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      {stats && (
        <section className="border-y border-border bg-card">
          <div className="container py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: "Sports Clubs", value: stats.total, icon: Trophy },
                { label: "Verified Clubs", value: stats.verified, icon: BadgeCheck },
                { label: "Cities", value: stats.cities, icon: MapPin },
                { label: "Sports", value: stats.sports, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-display text-3xl font-bold text-foreground">{value}+</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by City ─────────────────────────────────────────────────── */}
      <section className="py-8 bg-secondary/20">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">Browse by City</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {featuredCities.map((city) => (
              <Link
                key={city.key}
                href={`/india/${city.key}`}
                className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {city.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{city.state}</div>
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ── Nearest to You ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BadgeCheck className="w-5 h-5 text-accent" />
                <h2 className="font-display text-2xl font-bold text-foreground">Nearest to You</h2>
              </div>
              <p className="text-muted-foreground">Popular clubs in Chennai</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/explore?verified=true" className="gap-1.5">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <ClubGridSkeleton count={8} />
          ) : featuredData?.clubs.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredData.clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No verified clubs yet"
              description="Be the first to submit your club for verification."
              action={{ label: "Add Your Club", href: "/submit" }}
            />
          )}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Run a Sports Club in India?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            List your club for free and connect with thousands of sports enthusiasts across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link href="/submit">
                <Plus className="w-4 h-4" />
                Add Your Club — It's Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/explore">Browse All Clubs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
