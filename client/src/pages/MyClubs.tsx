import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, Clock, Edit, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MyClubs() {
  const { isAuthenticated, loading } = useAuth();

  const { data: clubs, isLoading } = trpc.clubs.myClubs.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: claims } = trpc.claims.myClaims.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-4 w-full max-w-md border-[#222222] bg-[#141414]">
          <CardContent className="px-8 pb-10 pt-10 text-center">
            <p className="section-label mb-2">// Access</p>
            <h2 className="font-display text-xl font-black uppercase tracking-wide text-foreground">Sign in required</h2>
            <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">Sign in to manage your clubs.</p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 md:py-20">
      <div className="container max-w-4xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-2">// Console</p>
            <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground md:text-4xl">
              My clubs
            </h1>
            <p className="mt-2 text-[15px] text-[#aaaaaa]">Manage listings and submissions</p>
          </div>
          <Button asChild className="w-fit gap-2">
            <Link href="/submit">
              <Plus className="size-4" /> Add club
            </Link>
          </Button>
        </div>

        <section className="mb-12">
          <h2 className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Your clubs</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-none border border-[#222222]" />
              ))}
            </div>
          ) : clubs && clubs.length > 0 ? (
            <div className="space-y-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center gap-4 border border-[#222222] bg-[#141414] p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                        {club.name}
                      </span>
                      {club.verified ? (
                        <span className="inline-flex items-center gap-1 border border-primary bg-primary px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                          <BadgeCheck className="size-3" /> Verified
                        </span>
                      ) : (
                        <span className="border border-amber-800 bg-amber-950/40 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400">
                          Pending review
                        </span>
                      )}
                    </div>
                    <div className="text-[14px] text-[#888888]">
                      {club.cityLabel} · {club.sportLabel}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" asChild className="gap-1.5 border-white">
                      <Link href={`/my-clubs/${club.id}/edit`}>
                        <Edit className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-white">
                      <Link href={`/clubs/${club.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#333] bg-[#111111] p-12 text-center">
              <p className="mb-6 text-[15px] text-[#aaaaaa]">You haven&apos;t added any clubs yet.</p>
              <Button asChild size="sm" className="gap-2">
                <Link href="/submit">
                  <Plus className="size-3.5" /> Add your first club
                </Link>
              </Button>
            </div>
          )}
        </section>

        {claims && claims.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              Pending claims
            </h2>
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="flex items-center gap-4 border border-[#222222] bg-[#141414] p-5">
                  <Clock className="size-5 shrink-0 text-[#888888]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">Claim for club #{claim.clubId}</div>
                    <div className="mt-0.5 text-xs text-[#888888]">
                      Submitted {new Date(claim.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "border px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em]",
                      claim.status === "pending"
                        ? "border-amber-800 bg-amber-950/40 text-amber-400"
                        : claim.status === "approved"
                          ? "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                          : "border-red-800 bg-red-950/40 text-red-400"
                    )}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
