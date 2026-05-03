import { Link } from "wouter";
import { CITIES, SPORTS } from "../../../shared/constants";

export default function Footer() {
  const featuredCities = CITIES.slice(0, 6);
  const featuredSports = SPORTS.slice(0, 6);

  return (
    <footer className="mt-auto border-t border-[#1a1a1a] bg-[#0a0a0a] text-foreground">
      <div className="container py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-6 inline-block">
              <img
                src="/treadgram-logo.png"
                alt="Treadgram"
                width={220}
                height={44}
                className="h-10 w-auto max-w-full object-contain object-left md:h-11"
              />
            </Link>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#aaaaaa]">
              Discover verified running clubs, races, and training crews. List your community, publish events, and grow
              your tribe across India.
            </p>
          </div>

          <div>
            <p className="section-label mb-4">// 01 — Cities</p>
            <ul className="space-y-2">
              {featuredCities.map((city) => (
                <li key={city.key}>
                  <Link
                    href={`/india/${city.key}`}
                    className="text-[15px] text-[#888888] transition-colors hover:text-foreground"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-label mb-4">// 02 — Sports</p>
            <ul className="space-y-2">
              {featuredSports.map((sport) => (
                <li key={sport.key}>
                  <Link
                    href={`/explore?sport=${sport.key}`}
                    className="text-[15px] text-[#888888] transition-colors hover:text-foreground"
                  >
                    {sport.emoji} {sport.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-label mb-4">// 03 — Platform</p>
            <ul className="space-y-2">
              {[
                { href: "/submit", label: "List your club" },
                { href: "/explore", label: "Browse clubs" },
                { href: "/events", label: "Events" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#888888] transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#1a1a1a] pt-8 sm:flex-row">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[#888888]">
            © {new Date().getFullYear()} Treadgram
          </p>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[#888888]">
            Built for crews who move
          </p>
        </div>
      </div>
    </footer>
  );
}
