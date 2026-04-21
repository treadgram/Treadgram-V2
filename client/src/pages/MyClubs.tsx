import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyClubs() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: clubs, isLoading } = trpc.clubs.myClubs.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: claims } = trpc.claims.myClaims.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="font-display text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground text-sm mb-6">Sign in to manage your clubs.</p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Clubs</h1>
            <p className="text-muted-foreground mt-1">Manage your sports clubs and submissions</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/submit">
              <Plus className="w-4 h-4" /> Add Club
            </Link>
          </Button>
        </div>

        {/* Owned clubs */}
        <section className="mb-10">
          <h2 className="font-semibold text-base text-foreground mb-4">Your Clubs</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : clubs && clubs.length > 0 ? (
            <div className="space-y-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-foreground">{club.name}</span>
                      {club.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {club.cityLabel} · {club.sportLabel}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="gap-1.5">
                      <Link href={`/my-clubs/${club.id}/edit`}>
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clubs/${club.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-xl p-10 text-center">
              <p className="text-muted-foreground text-sm mb-4">You haven't added any clubs yet.</p>
              <Button asChild size="sm" className="gap-2">
                <Link href="/submit"><Plus className="w-3.5 h-3.5" /> Add Your First Club</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Pending claims */}
        {claims && claims.length > 0 && (
          <section>
            <h2 className="font-semibold text-base text-foreground mb-4">Pending Claims</h2>
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">Claim for Club #{claim.clubId}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Submitted {new Date(claim.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full",
                    claim.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    claim.status === "approved" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  )}>
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
