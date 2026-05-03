import { trpc } from "@/lib/trpc";
import { CITIES, SPORTS } from "../../../shared/constants";
import { ArrowRight, BadgeCheck, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import ClubCard from "../components/clubs/ClubCard";
import { ClubGridSkeleton } from "../components/clubs/ClubCardSkeleton";
import EmptyState from "../components/clubs/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1552674605-46d536d23227?auto=format&fit=crop&w=2400&q=80";

const TICKER_ITEMS = [
  "MARATHONS",
  "TRAIL RUNS",
  "CORPORATE MEETS",
  "CITY LEAGUES",
  "NIGHT RUNS",
  "ULTRA SERIES",
];

const EVENT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1552674605-46d536d23227?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1461896836934-ffe607821721?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c62306601b7?auto=format&fit=crop&w=900&q=80",
];

function eventTypeBadge(title: string) {
  const t = title.toUpperCase();
  if (t.includes("MARATHON")) return "MARATHON";
  if (t.includes("NIGHT")) return "NIGHT RUN";
  if (/\b5\s*K\b|\b5K\b/i.test(title)) return "5K SPRINT";
  if (t.includes("TRAIL")) return "TRAIL RUN";
  return "RUN";
}

export default function Home() {
  const [, navigate] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const { data: featuredData, isLoading: loadingFeatured } = trpc.clubs.list.useQuery({
    verified: true,
    page: 1,
    limit: 8,
  });
  const { data: feedEvents, isLoading: loadingFeed } = trpc.events.feed.useQuery({ limit: 6 });

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

  const tickerNodes = TICKER_ITEMS.map((item) => (
    <span key={item} className="flex shrink-0 items-center gap-12">
      <span>{item}</span>
      <span className="text-primary">×</span>
    </span>
  ));

  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex min-h-[100dvh] flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden />

        <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col px-0">
          <div className="container flex flex-1 flex-col pt-10 pb-12 md:pt-14 md:pb-20">
            <div className="max-w-3xl flex-1">
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden />
                <span className="section-label text-primary">// Treadgram</span>
              </div>

              <h1 className="heading-hero mb-2 text-[clamp(3rem,12vw,5.5rem)] leading-[0.92] md:leading-[0.9]">
                Run.
              </h1>
              <h1 className="heading-hero mb-2 text-[clamp(3rem,12vw,5.5rem)] leading-[0.92] md:leading-[0.9]">
                Organize.
              </h1>
              <h1 className="heading-hero mb-8 text-[clamp(3rem,12vw,5.5rem)] leading-[0.92] text-primary md:leading-[0.9]">
                Dominate.
              </h1>

              <p className="max-w-lg text-[15px] leading-relaxed text-[#aaaaaa] md:text-[16px]">
                Treadgram is the command center for crews and race directors. Discover verified clubs, lock in
                events, and own your city&apos;s running scene — one listing, one calendar, zero noise.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-5">
              <Button size="lg" className="min-h-12 w-full sm:w-auto" asChild>
                <Link href="/signup">
                  Join the movement <span aria-hidden>→</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-h-12 w-full border-white sm:w-auto" asChild>
                <Link href="/events">Browse events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#1a1a1a] bg-black py-4">
        <div className="marquee-track font-display text-[clamp(1.5rem,4vw,2.25rem)] font-black uppercase tracking-[0.08em] text-white">
          <div className="flex items-center pr-12">{tickerNodes}</div>
          <div className="flex items-center pr-12" aria-hidden>
            {tickerNodes}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1a1a1a] bg-black py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col divide-y divide-[#222] border border-[#222] md:flex-row md:divide-x md:divide-y-0">
            {[
              { n: "5000+", l: "ACTIVE RUNNERS" },
              { n: "8", l: "CITIES COVERED" },
              { n: "50+", l: "CLUBS ONBOARDED" },
            ].map((s) => (
              <div key={s.l} className="flex flex-1 flex-col px-6 py-10 md:py-12">
                <div className="border-l-[3px] border-primary pl-5">
                  <div className="font-display text-[clamp(2.5rem,6vw,4rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
                    {s.n}
                  </div>
                  <div className="mt-3 font-display text-[12px] font-bold uppercase tracking-[0.16em] text-[#666666]">
                    {s.l}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1a1a1a] bg-[#0a0a0a] py-16 md:py-24">
        <div className="container">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label mb-3">// 02 — Live events</p>
              <h2 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-white">
                The grid is active.
              </h2>
            </div>
            <Button variant="outline" asChild className="h-12 w-full shrink-0 border-white md:w-auto">
              <Link href="/events" className="gap-2">
                View all <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>

          {loadingFeed ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-none" />
              ))}
            </div>
          ) : feedEvents && feedEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {feedEvents.map((e, idx) => {
                const img = e.clubCoverImageUrl ?? EVENT_CARD_IMAGES[e.id % EVENT_CARD_IMAGES.length];
                const city = e.clubCityLabel.toUpperCase();
                const name = e.title.toUpperCase();
                const badge = eventTypeBadge(e.title);
                return (
                  <Link key={e.id} href={`/events/${e.id}`} className="group block">
                    <article
                      className={`relative aspect-[3/4] overflow-hidden border bg-[#111] transition-[transform,border-color] duration-200 hover:scale-[1.02] hover:border-primary ${
                        idx === 0 ? "border-2 border-primary" : "border border-[#2a2a2a]"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-[filter] duration-200 group-hover:brightness-110"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute left-3 top-3 z-10">
                        <span className="bg-primary px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                          {badge}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pt-16">
                        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#aaaaaa]">
                          {city}
                        </p>
                        <h3 className="mt-1 font-display text-2xl font-black uppercase leading-tight tracking-wide text-white md:text-[28px]">
                          {name}
                        </h3>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-[#1a1a1a] bg-[#111111] py-20 md:py-24">
        <div className="container">
          <p className="section-label mb-3">// 03 — Discover</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground md:text-4xl">
            Find your <span className="text-primary">crew</span>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-[#aaaaaa]">
            Search clubs, cities, or sports. Go wide or filter down to what matters tonight.
          </p>
          <form onSubmit={handleSearch} className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <div className="relative min-h-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#888888]" />
              <Input
                placeholder="Search clubs, cities, sports..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-12 border-[#222222] bg-[#0a0a0a] pl-10"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 shrink-0 px-8">
              Search
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {featuredSports.slice(0, 6).map((sport) => (
              <Link
                key={sport.key}
                href={`/explore?sport=${sport.key}`}
                className="border border-[#222222] bg-[#141414] px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-[filter,border-color] hover:border-primary hover:text-primary"
              >
                {sport.emoji} {sport.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1a1a1a] bg-[#111111] py-20 md:py-28">
        <div className="container">
          <p className="section-label mb-3">// 04 — Cities</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground md:text-4xl">
            Browse by <span className="text-primary">city</span>
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {featuredCities.map((city) => (
              <Link
                key={city.key}
                href={`/india/${city.key}`}
                className="group border border-[#222222] bg-[#141414] p-5 transition-[filter,border-color] hover:border-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-base font-bold uppercase tracking-wide text-foreground transition-colors group-hover:text-primary">
                      {city.label}
                    </div>
                    <div className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[#888888]">
                      {city.state}
                    </div>
                  </div>
                  <MapPin className="size-4 shrink-0 text-[#888888] transition-colors group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-3">// 05 — Featured</p>
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-6 text-primary" />
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground md:text-4xl">
                  Nearest to you
                </h2>
              </div>
              <p className="mt-2 text-[15px] text-[#aaaaaa]">Verified clubs in Chennai</p>
            </div>
            <Button variant="outline" asChild className="w-fit border-white">
              <Link href="/explore?verified=true" className="gap-2">
                See all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <ClubGridSkeleton count={8} />
          ) : featuredData?.clubs.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredData.clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No verified clubs yet"
              description="Be the first to submit your club for verification."
              action={{ label: "List your club", href: "/submit" }}
            />
          )}
        </div>
      </section>

      <section className="border-t border-[#1a1a1a] bg-primary py-20 text-primary-foreground md:py-28">
        <div className="container text-center">
          <p className="mb-4 font-display text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground/90">
            // 06 — Operators
          </p>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.02em] md:text-5xl">Run a club?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-primary-foreground/85">
            List free on Treadgram. Own your page, drop events, and recruit athletes who actually show up.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="min-w-[200px] border-0 bg-[#0a0a0a] text-white hover:brightness-110">
              <Link href="/submit">List your club</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-w-[200px] border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/explore">Browse all</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
