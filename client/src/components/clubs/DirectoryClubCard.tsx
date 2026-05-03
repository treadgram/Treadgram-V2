import { cn } from "@/lib/utils";
import type { Club } from "../../../../drizzle/schema";
import { getClubPath } from "../../../../shared/constants";
import { Link } from "wouter";
import { Button } from "../ui/button";

interface DirectoryClubCardProps {
  club: Club;
  className?: string;
}

/** Interest proxy — schema has no member count */
function interestLabel(club: Club) {
  if (club.reviewCount > 0) return `${club.reviewCount} reviews`;
  if (club.viewCount > 0) return `${club.viewCount.toLocaleString("en-IN")} views`;
  return "New listing";
}

export default function DirectoryClubCard({ club, className }: DirectoryClubCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col border border-[#2a2a2a] bg-[#141414] p-5 md:flex-row md:items-center md:justify-between md:gap-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center border border-[#333] bg-[#1a1a1a]">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="font-display text-xl font-black text-[#666]">{club.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl font-black uppercase tracking-wide text-white md:text-2xl">{club.name}</h3>
          <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[#888888]">
            {club.cityLabel}
          </p>
          <p className="mt-2 text-[14px] text-[#666666]">{interestLabel(club)}</p>
        </div>
      </div>
      <Button className="mt-5 h-11 w-full shrink-0 md:mt-0 md:w-36" asChild>
        <Link href={getClubPath(club.slug)}>Join</Link>
      </Button>
    </div>
  );
}
