import { Trophy } from "lucide-react";
import { Link } from "wouter";
import { CITIES, SPORTS } from "../../../shared/constants";

export default function Footer() {
  const featuredCities = CITIES.slice(0, 6);
  const featuredSports = SPORTS.slice(0, 6);

  return (
    <footer className="bg-sidebar text-sidebar-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TreadGram
              </span>
            </Link>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
              Your Sports Tribe — discover and join running clubs, cycling groups, yoga studios, and more sports communities across India.
            </p>
          </div>

          {/* Cities */}
          <div>
            <h4 className="font-semibold text-sm text-sidebar-foreground/80 uppercase tracking-wider mb-3">
              Popular Cities
            </h4>
            <ul className="space-y-2">
              {featuredCities.map((city) => (
                <li key={city.key}>
                  <Link
                    href={`/india/${city.key}`}
                    className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-semibold text-sm text-sidebar-foreground/80 uppercase tracking-wider mb-3">
              Sports
            </h4>
            <ul className="space-y-2">
              {featuredSports.map((sport) => (
                <li key={sport.key}>
                  <Link
                    href={`/explore?sport=${sport.key}`}
                    className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                  >
                    {sport.emoji} {sport.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm text-sidebar-foreground/80 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/submit", label: "Add Your Club" },
                { href: "/explore", label: "Browse All Clubs" },
                { href: "/events", label: "Upcoming Events" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-foreground/40">
            © {new Date().getFullYear()} ClubsIndia. Discover sports communities across India.
          </p>
          <p className="text-xs text-sidebar-foreground/40">
            Built with ❤️ for the Indian sports community
          </p>
        </div>
      </div>
    </footer>
  );
}
