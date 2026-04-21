import { cn } from "@/lib/utils";
import type { Club } from "../../../../drizzle/schema";
import { getSportColor, getSportEmoji, getClubPath } from "../../../../shared/constants";
import {
  BadgeCheck,
  MapPin,
  MessageCircle,
  Instagram,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "../ui/badge";

interface ClubCardProps {
  club: Club;
  className?: string;
}

export default function ClubCard({ club, className }: ClubCardProps) {
  const sportColor = getSportColor(club.sport);
  const sportEmoji = getSportEmoji(club.sport);

  return (
    <Link href={getClubPath(club.slug)}>
      <article
        className={cn(
          "group bg-card rounded-xl border border-border overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
          club.verified && "ring-1 ring-accent/30",
          className
        )}
      >
        {/* Cover image / placeholder */}
        <div className="relative h-36 bg-gradient-to-br from-secondary to-muted overflow-hidden">
          {club.coverImageUrl ? (
            <img
              src={club.coverImageUrl}
              alt={club.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20">{sportEmoji}</span>
            </div>
          )}

          {/* Sport badge */}
          <div className="absolute top-3 left-3">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", sportColor)}>
              {sportEmoji} {club.sportLabel}
            </span>
          </div>

          {/* Verified badge */}
          {club.verified && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground shadow-sm">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
          )}

          {/* Logo overlay */}
          {club.logoUrl && (
            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-card border border-border shadow-sm overflow-hidden">
              <img src={club.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display font-semibold text-base text-card-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {club.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{club.cityLabel}</span>
          </div>

          {club.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {club.shortDescription}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Rating */}
            {club.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{Number(club.avgRating).toFixed(1)}</span>
                <span>({club.reviewCount})</span>
              </div>
            )}

            {/* Pricing */}
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                club.pricingType === "free"
                  ? "bg-green-100 text-green-700"
                  : club.pricingType === "paid"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              )}
            >
              {club.pricingType === "free" ? "Free" : club.pricingType === "paid" ? `₹${club.monthlyFeeInr ?? "Paid"}` : "Donation"}
            </span>

            {/* Beginner friendly */}
            {club.beginnerFriendly && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                Beginner Friendly
              </span>
            )}
          </div>

          {/* Social links */}
          {(club.instagramUrl || club.whatsappUrl) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              {club.instagramUrl && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </span>
              )}
              {club.whatsappUrl && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
