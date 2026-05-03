import { Skeleton } from "../ui/skeleton";

export default function ClubCardSkeleton() {
  return (
    <div className="overflow-hidden border border-[#222222] bg-card">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4 rounded-none" />
        <Skeleton className="h-3.5 w-1/3 rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-5/6 rounded-none" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-12 rounded-none" />
          <Skeleton className="h-5 w-16 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function ClubGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ClubCardSkeleton key={i} />
      ))}
    </div>
  );
}
