import { cn } from "@/lib/utils";
import type { Club } from "../../../../drizzle/schema";
import { getSportColor, getSportEmoji, getClubPath } from "../../../../shared/constants";
import {
  BadgeCheck,
  MapPin,
  MessageCircle,
  Instagram,
  Star,
} from "lucide-react";
import { Link } from "wouter";

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
          "group cursor-pointer border border-[#222222] bg-[#141414] transition-[filter,border-color]",
          "hover:border-primary hover:brightness-[1.02]",
          club.verified && "border-primary/40",
          className
        )}
      >
        <div className="relative h-36 overflow-hidden bg-[#111111]">
          {club.coverImageUrl ? (
            <img
              src={club.coverImageUrl}
              alt={club.name}
              className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-25">{sportEmoji}</span>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 border border-[#222222] bg-black/70 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm",
                sportColor
              )}
            >
              {sportEmoji} {club.sportLabel}
            </span>
          </div>

          {club.verified && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center gap-1 border border-primary bg-primary px-2 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            </div>
          )}

          {club.logoUrl && (
            <div className="absolute bottom-3 left-3 size-10 overflow-hidden border border-[#222222] bg-[#141414]">
              <img src={club.logoUrl} alt="" className="size-full object-cover" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-card-foreground transition-colors group-hover:text-primary">
            {club.name}
          </h3>

          <div className="mb-2 mt-1 flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            <MapPin className="size-3 shrink-0" />
            <span>{club.cityLabel}</span>
          </div>

          {club.shortDescription && (
            <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-[#aaaaaa]">{club.shortDescription}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {club.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-[#888888]">
                <Star className="size-3.5 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{Number(club.avgRating).toFixed(1)}</span>
                <span>({club.reviewCount})</span>
              </div>
            )}

            <span
              className={cn(
                "border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em]",
                club.pricingType === "free"
                  ? "border-emerald-800 bg-emerald-950/50 text-emerald-400"
                  : club.pricingType === "paid"
                    ? "border-sky-800 bg-sky-950/50 text-sky-300"
                    : "border-violet-800 bg-violet-950/50 text-violet-300"
              )}
            >
              {club.pricingType === "free"
                ? "Free"
                : club.pricingType === "paid"
                  ? `₹${club.monthlyFeeInr ?? "Paid"}`
                  : "Donation"}
            </span>

            {club.beginnerFriendly && (
              <span className="border border-[#333] bg-[#181818] px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaaaaa]">
                Beginner friendly
              </span>
            )}
          </div>

          {(club.instagramUrl || club.whatsappUrl) && (
            <div className="mt-3 flex items-center gap-3 border-t border-[#222222] pt-3">
              {club.instagramUrl && (
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#888888]">
                  <Instagram className="size-3.5" />
                  Instagram
                </span>
              )}
              {club.whatsappUrl && (
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#888888]">
                  <MessageCircle className="size-3.5" />
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
