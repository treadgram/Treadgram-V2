import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle,
  Clock,
  Flag,
  LayoutDashboard,
  ShieldAlert,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const isAdmin = user?.role === "admin" || (user as any)?.role === "moderator";

  const { data: stats } = trpc.clubs.adminStats.useQuery(undefined, { enabled: isAdmin });
  const { data: pendingClubs, isLoading: loadingPending } = trpc.clubs.adminList.useQuery(
    { page: 1, limit: 20 },
    { enabled: isAdmin }
  );
  const { data: pendingClaims, isLoading: loadingClaims } = trpc.claims.pending.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const approveMutation = trpc.clubs.approve.useMutation({
    onSuccess: () => {
      toast.success("Club approved!");
      utils.clubs.adminList.invalidate();
      utils.clubs.adminStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectMutation = trpc.clubs.reject.useMutation({
    onSuccess: () => {
      toast.success("Club rejected.");
      setRejectDialogOpen(false);
      setRejectNote("");
      utils.clubs.adminList.invalidate();
      utils.clubs.adminStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleVerifiedMutation = trpc.clubs.toggleVerified.useMutation({
    onSuccess: (data) => {
      toast.success(data.verified ? "Club verified!" : "Verification removed.");
      utils.clubs.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const approveClaimMutation = trpc.claims.approve.useMutation({
    onSuccess: () => {
      toast.success("Claim approved! Club owner assigned.");
      utils.claims.pending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectClaimMutation = trpc.claims.reject.useMutation({
    onSuccess: () => {
      toast.success("Claim rejected.");
      utils.claims.pending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return null;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You need admin or moderator privileges to access this dashboard.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = pendingClubs?.clubs.filter((c) => c.status === "pending").length ?? 0;
  const pendingClaimsCount = pendingClaims?.filter((c) => c.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage clubs, claims, and verifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Clubs", value: (stats.pending + stats.approved + stats.rejected), icon: Trophy, color: "text-primary" },
              { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-500" },
              { label: "Approved", value: stats.approved, icon: BadgeCheck, color: "text-accent" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="shadow-sm">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", color)} />
                    <div>
                      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              Pending Clubs
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="claims" className="gap-2">
              Claims
              {pendingClaimsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingClaimsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Clubs</TabsTrigger>
          </TabsList>

          {/* ── Pending Clubs ── */}
          <TabsContent value="pending">
            {loadingPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClubs?.clubs.filter((c) => c.status === "pending").map((club) => (
                  <div key={club.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-semibold text-foreground">{club.name}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {club.cityLabel} · {club.sportLabel} · {club.pricingType}
                        </div>
                        {club.shortDescription && (
                          <p className="text-sm text-foreground/70 line-clamp-2">{club.shortDescription}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1.5">
                          Submitted {new Date(club.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/clubs/${club.slug}`} target="_blank">Preview</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => {
                            setRejectTarget({ id: club.id, name: club.name });
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => approveMutation.mutate({ id: club.id })}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingClubs?.clubs.filter((c) => c.status === "pending").length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-accent" />
                    <p className="font-medium">All caught up! No pending submissions.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Claims ── */}
          <TabsContent value="claims">
            {loadingClaims ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClaims?.filter((c: any) => c.status === "pending").map((claim: any) => (
                  <div key={claim.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">Claim for Club #{claim.clubId}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          User #{claim.userId} · Submitted {new Date(claim.createdAt).toLocaleDateString("en-IN")}
                        </div>
                        {claim.proofText && (
                          <p className="text-sm text-foreground/70 bg-secondary/50 rounded-lg p-3 line-clamp-3">
                            {claim.proofText}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => rejectClaimMutation.mutate({ id: claim.id, note: "Rejected by moderator" })}
                          disabled={rejectClaimMutation.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveClaimMutation.mutate({ id: claim.id })}
                          disabled={approveClaimMutation.isPending}
                          className="gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingClaims?.filter((c: any) => c.status === "pending").length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-accent" />
                    <p className="font-medium">No pending claims.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── All Clubs ── */}
          <TabsContent value="all">
            <div className="space-y-3">
                {pendingClubs?.clubs.map((club: any) => (
                <div key={club.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-medium text-foreground text-sm">{club.name}</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                        club.status === "approved" ? "bg-green-100 text-green-700" :
                        club.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {club.status}
                      </span>
                      {club.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{club.cityLabel} · {club.sportLabel}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerifiedMutation.mutate({ id: club.id })}
                      disabled={toggleVerifiedMutation.isPending}
                      className={club.verified ? "text-amber-600" : "text-accent"}
                    >
                      <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                      {club.verified ? "Unverify" : "Verify"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clubs/${club.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Club Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rejecting <strong>{rejectTarget?.name}</strong>. Please provide a reason.
            </p>
            <div className="space-y-1.5">
              <Label>Rejection Reason <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="e.g. Duplicate listing, insufficient information..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={rejectNote.length < 5 || rejectMutation.isPending}
              onClick={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote })}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
