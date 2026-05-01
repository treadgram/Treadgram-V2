import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Calendar,
  Clock,
  Flag,
  LayoutDashboard,
  LogOut,
  Shield,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ElementType } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

const USER_PAGE_SIZE = 40;
const CLUB_PAGE_SIZE = 20;
const EVENT_PAGE_SIZE = 20;
const PENDING_PAGE_SIZE = 15;

type Section =
  | "overview"
  | "pending"
  | "claims"
  | "clubs"
  | "users"
  | "events"
  | "analytics";

export default function SystemConsole() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  const [section, setSection] = useState<Section>("overview");

  const [pendingPage, setPendingPage] = useState(1);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const [clubPage, setClubPage] = useState(1);
  const [clubStatus, setClubStatus] = useState<"" | "pending" | "approved" | "rejected">("");
  const [clubVerified, setClubVerified] = useState<"all" | "yes" | "no">("all");
  const [clubSearch, setClubSearch] = useState("");
  const [clubCity, setClubCity] = useState("");
  const [clubSport, setClubSport] = useState("");

  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState<"" | "user" | "admin" | "moderator">("");

  const [eventPage, setEventPage] = useState(1);
  const [eventClubId, setEventClubId] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventOpen, setEventOpen] = useState<"all" | "yes" | "no">("all");
  const [eventTimeRange, setEventTimeRange] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !isAdmin) navigate("/system/login");
  }, [loading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    setClubPage(1);
  }, [clubStatus, clubVerified, clubSearch, clubCity, clubSport]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userRole]);

  useEffect(() => {
    setEventPage(1);
  }, [eventClubId, eventSearch, eventOpen, eventTimeRange]);

  const { data: stats } = trpc.clubs.adminStats.useQuery(undefined, { enabled: isAdmin });
  const { data: pendingClubs, isLoading: loadingPending } = trpc.clubs.adminList.useQuery(
    { page: pendingPage, limit: PENDING_PAGE_SIZE, status: "pending" },
    { enabled: isAdmin && section === "pending" }
  );
  const { data: browseClubs, isLoading: loadingBrowseClubs } = trpc.clubs.adminList.useQuery(
    {
      page: clubPage,
      limit: CLUB_PAGE_SIZE,
      status: clubStatus || undefined,
      verified:
        clubVerified === "yes" ? true : clubVerified === "no" ? false : undefined,
      search: clubSearch.trim() || undefined,
      city: clubCity.trim() || undefined,
      sport: clubSport.trim() || undefined,
    },
    { enabled: isAdmin && section === "clubs" }
  );
  const { data: pendingClaims, isLoading: loadingClaims } = trpc.claims.pending.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: analytics, isLoading: loadingAnalytics } = trpc.analytics.summary.useQuery(undefined, {
    enabled: isAdmin && (section === "overview" || section === "analytics"),
  });
  const { data: allUsersData, isLoading: loadingAllUsers } = trpc.auth.allUsers.useQuery(
    {
      page: userPage,
      limit: USER_PAGE_SIZE,
      search: userSearch.trim() || undefined,
      role: userRole || undefined,
    },
    { enabled: isAdmin && section === "users" }
  );
  const eventClubIdNum = eventClubId.trim() ? Number.parseInt(eventClubId.trim(), 10) : NaN;
  const { data: adminEvents, isLoading: loadingEvents } = trpc.events.adminList.useQuery(
    {
      page: eventPage,
      limit: EVENT_PAGE_SIZE,
      clubId: Number.isFinite(eventClubIdNum) && eventClubIdNum > 0 ? eventClubIdNum : undefined,
      search: eventSearch.trim() || undefined,
      isOpen: eventOpen === "yes" ? true : eventOpen === "no" ? false : undefined,
      timeRange: eventTimeRange,
    },
    { enabled: isAdmin && section === "events" }
  );

  const approveMutation = trpc.clubs.approve.useMutation({
    onSuccess: () => {
      toast.success("Club approved");
      utils.clubs.adminList.invalidate();
      utils.clubs.adminStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectMutation = trpc.clubs.reject.useMutation({
    onSuccess: () => {
      toast.success("Club rejected");
      setRejectDialogOpen(false);
      setRejectNote("");
      utils.clubs.adminList.invalidate();
      utils.clubs.adminStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleVerifiedMutation = trpc.clubs.toggleVerified.useMutation({
    onSuccess: (data) => {
      toast.success(data.verified ? "Verified" : "Verification removed");
      utils.clubs.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const approveClaimMutation = trpc.claims.approve.useMutation({
    onSuccess: () => {
      toast.success("Claim approved");
      utils.claims.pending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectClaimMutation = trpc.claims.reject.useMutation({
    onSuccess: () => {
      toast.success("Claim rejected");
      utils.claims.pending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Checking access…</div>
      </div>
    );
  }

  const pendingClaimsCount = pendingClaims?.filter((c) => c.status === "pending").length ?? 0;
  const userTotalPages = Math.max(1, Math.ceil((allUsersData?.total ?? 0) / USER_PAGE_SIZE));
  const clubTotalPages = Math.max(1, Math.ceil((browseClubs?.total ?? 0) / CLUB_PAGE_SIZE));
  const eventTotalPages = Math.max(1, Math.ceil((adminEvents?.total ?? 0) / EVENT_PAGE_SIZE));
  const pendingClubTotalPages = Math.max(1, Math.ceil((pendingClubs?.total ?? 0) / PENDING_PAGE_SIZE));

  const nav = (items: { id: Section; label: string; icon: ElementType; badge?: number }[]) => (
    <nav className="space-y-1">
      {items.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          type="button"
          onClick={() => setSection(id)}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
            section === id
              ? "bg-amber-500/20 text-amber-100 border border-amber-500/30"
              : "text-slate-300 hover:bg-white/5 border border-transparent"
          )}
        >
          <Icon className="w-4 h-4 shrink-0 text-amber-400/90" />
          <span className="flex-1 truncate">{label}</span>
          {badge != null && badge > 0 && (
            <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-slate-900/80 backdrop-blur z-10">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">Owner console</h1>
              <p className="text-xs text-slate-400">Users, clubs, events, claims, analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-1" /> Site
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200"
              onClick={async () => {
                await logout();
                navigate("/system/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 shrink-0 border-r border-white/10 bg-slate-900/50 p-3 overflow-y-auto hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 px-2 mb-2">Dashboard</p>
          {nav([
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "pending", label: "Pending clubs", icon: Clock, badge: stats?.pending },
            { id: "claims", label: "Claims", icon: Flag, badge: pendingClaimsCount },
            { id: "clubs", label: "All clubs", icon: Trophy },
            { id: "users", label: "Users", icon: Users },
            { id: "events", label: "Events", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ])}
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sm:hidden border-b border-white/10 p-2 bg-slate-900/50">
            <Select value={section} onValueChange={(v) => setSection(v as Section)}>
              <SelectTrigger className="w-full bg-slate-950 border-white/10 text-slate-100">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="pending">Pending clubs</SelectItem>
                <SelectItem value="claims">Claims</SelectItem>
                <SelectItem value="clubs">All clubs</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="container py-6 lg:py-8 max-w-[1600px]">
            {section === "overview" && (
              <>
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      {
                        label: "Clubs (all statuses)",
                        value: stats.pending + stats.approved + stats.rejected,
                        icon: Trophy,
                      },
                      { label: "Pending clubs", value: stats.pending, icon: Clock },
                      { label: "Approved", value: stats.approved, icon: BadgeCheck },
                      { label: "Rejected", value: stats.rejected, icon: XCircle },
                    ].map(({ label, value, icon: Icon }) => (
                      <Card key={label} className="bg-slate-900/60 border-white/10">
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                          <Icon className="w-5 h-5 text-amber-400" />
                          <div>
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="text-xs text-slate-400">{label}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {analytics && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "Page views", value: analytics.pageViews },
                      { label: "Outbound clicks", value: analytics.outboundClicks },
                      { label: "Searches", value: analytics.searches },
                    ].map((a) => (
                      <Card key={a.label} className="bg-slate-900/60 border-white/10">
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="text-xl font-bold">{a.value}</div>
                            <div className="text-xs text-slate-400">{a.label}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-8">
                  Use the sidebar to review pending submissions, browse all clubs and users with filters, or inspect
                  listed events.
                </p>
              </>
            )}

            {section === "pending" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Pending club submissions</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={pendingPage <= 1}
                      onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {pendingPage} / {pendingClubTotalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={pendingPage >= pendingClubTotalPages}
                      onClick={() => setPendingPage((p) => Math.min(pendingClubTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                {loadingPending ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-28 rounded-xl bg-slate-800" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingClubs?.clubs.map((club) => (
                      <div key={club.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white">{club.name}</div>
                            <div className="text-sm text-slate-400 mt-1">
                              {club.cityLabel} · {club.sportLabel} · {club.pricingType}
                            </div>
                            {club.shortDescription && (
                              <p className="text-sm text-slate-300 mt-2 line-clamp-2">{club.shortDescription}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild className="border-white/15">
                              <Link href={`/clubs/${club.slug}`} target="_blank">
                                Preview
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/40 text-red-300"
                              onClick={() => {
                                setRejectTarget({ id: club.id, name: club.name });
                                setRejectDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
                              onClick={() => approveMutation.mutate({ id: club.id })}
                              disabled={approveMutation.isPending}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingClubs?.clubs.length === 0 && (
                      <p className="text-center text-slate-500 py-12">No pending clubs.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {section === "claims" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Ownership claims</h2>
                {loadingClaims ? (
                  <Skeleton className="h-40 rounded-xl bg-slate-800" />
                ) : (
                  <div className="space-y-3">
                    {pendingClaims
                      ?.filter((c) => c.status === "pending")
                      .map((claim) => (
                        <div key={claim.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                          <div className="flex flex-wrap justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-white font-medium">
                                <Flag className="w-4 h-4 text-amber-400" />
                                Claim · club #{claim.clubId} · user #{claim.userId}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {new Date(claim.createdAt).toLocaleString("en-IN")}
                              </div>
                              {claim.proofText && (
                                <p className="text-sm text-slate-300 mt-3 bg-slate-950/50 rounded-lg p-3">
                                  {claim.proofText}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/40 text-red-300"
                                onClick={() => rejectClaimMutation.mutate({ id: claim.id, note: "Rejected" })}
                                disabled={rejectClaimMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-amber-500 text-slate-950"
                                onClick={() => approveClaimMutation.mutate({ id: claim.id })}
                                disabled={approveClaimMutation.isPending}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {pendingClaims?.filter((c) => c.status === "pending").length === 0 && (
                      <p className="text-center text-slate-500 py-12">No pending claims.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {section === "clubs" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">All clubs</h2>
                <Card className="bg-slate-900/60 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Search</Label>
                      <Input
                        value={clubSearch}
                        onChange={(e) => setClubSearch(e.target.value)}
                        placeholder="Name, slug, city…"
                        className="bg-slate-950 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">City</Label>
                      <Input
                        value={clubCity}
                        onChange={(e) => setClubCity(e.target.value)}
                        placeholder="City key or label"
                        className="bg-slate-950 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Sport</Label>
                      <Input
                        value={clubSport}
                        onChange={(e) => setClubSport(e.target.value)}
                        placeholder="Sport key or label"
                        className="bg-slate-950 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Status</Label>
                      <Select
                        value={clubStatus || "all"}
                        onValueChange={(v) => setClubStatus(v === "all" ? "" : (v as typeof clubStatus))}
                      >
                        <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Verified</Label>
                      <Select value={clubVerified} onValueChange={(v) => setClubVerified(v as typeof clubVerified)}>
                        <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Verified</SelectItem>
                          <SelectItem value="no">Not verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{browseClubs?.total ?? 0} clubs match</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={clubPage <= 1}
                      onClick={() => setClubPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {clubPage} / {clubTotalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={clubPage >= clubTotalPages}
                      onClick={() => setClubPage((p) => Math.min(clubTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <Card className="bg-slate-900/60 border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    {loadingBrowseClubs ? (
                      <Skeleton className="h-48 m-4 bg-slate-800" />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              <TableHead className="text-slate-400 whitespace-nowrap">ID</TableHead>
                              <TableHead className="text-slate-400">Name</TableHead>
                              <TableHead className="text-slate-400">Slug</TableHead>
                              <TableHead className="text-slate-400">City</TableHead>
                              <TableHead className="text-slate-400">Sport</TableHead>
                              <TableHead className="text-slate-400">Status</TableHead>
                              <TableHead className="text-slate-400">Verified</TableHead>
                              <TableHead className="text-slate-400">Pricing</TableHead>
                              <TableHead className="text-slate-400">Submitted</TableHead>
                              <TableHead className="text-slate-400">Owner</TableHead>
                              <TableHead className="text-slate-400">Created</TableHead>
                              <TableHead className="text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {browseClubs?.clubs.map((club) => (
                              <TableRow key={club.id} className="border-white/10">
                                <TableCell className="text-slate-400 font-mono text-xs">{club.id}</TableCell>
                                <TableCell className="text-slate-100 font-medium max-w-[180px] truncate">
                                  {club.name}
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs max-w-[120px] truncate">{club.slug}</TableCell>
                                <TableCell className="text-slate-300 text-xs whitespace-nowrap">{club.cityLabel}</TableCell>
                                <TableCell className="text-slate-300 text-xs whitespace-nowrap">{club.sportLabel}</TableCell>
                                <TableCell className="text-xs">
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded-full",
                                      club.status === "approved"
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : club.status === "pending"
                                          ? "bg-amber-500/20 text-amber-200"
                                          : "bg-red-500/20 text-red-300"
                                    )}
                                  >
                                    {club.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-slate-300 text-xs">{club.verified ? "Yes" : "No"}</TableCell>
                                <TableCell className="text-slate-400 text-xs">{club.pricingType}</TableCell>
                                <TableCell className="text-slate-400 font-mono text-xs">
                                  {club.submittedBy ?? "—"}
                                </TableCell>
                                <TableCell className="text-slate-400 font-mono text-xs">{club.ownedBy ?? "—"}</TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                                  {new Date(club.createdAt).toLocaleDateString("en-IN")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1 flex-wrap">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-white/15 h-8"
                                      onClick={() => toggleVerifiedMutation.mutate({ id: club.id })}
                                      disabled={toggleVerifiedMutation.isPending}
                                    >
                                      {club.verified ? "Unverify" : "Verify"}
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="border-white/15 h-8">
                                      <Link href={`/clubs/${club.slug}`}>View</Link>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {!loadingBrowseClubs && browseClubs?.clubs.length === 0 && (
                      <p className="text-center text-slate-500 py-12 text-sm">No clubs match these filters.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === "users" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Users</h2>
                <Card className="bg-slate-900/60 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-slate-400">Search</Label>
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Email, name, openId, phone…"
                        className="bg-slate-950 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Role</Label>
                      <Select
                        value={userRole || "all"}
                        onValueChange={(v) => setUserRole(v === "all" ? "" : (v as typeof userRole))}
                      >
                        <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All roles</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{allUsersData?.total ?? 0} users match</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {userPage} / {userTotalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <Card className="bg-slate-900/60 border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    {loadingAllUsers ? (
                      <Skeleton className="h-40 m-4 bg-slate-800" />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              <TableHead className="text-slate-400">ID</TableHead>
                              <TableHead className="text-slate-400">Open ID</TableHead>
                              <TableHead className="text-slate-400">Name</TableHead>
                              <TableHead className="text-slate-400">Email</TableHead>
                              <TableHead className="text-slate-400">Phone</TableHead>
                              <TableHead className="text-slate-400">Role</TableHead>
                              <TableHead className="text-slate-400">Login</TableHead>
                              <TableHead className="text-slate-400">Created</TableHead>
                              <TableHead className="text-slate-400">Updated</TableHead>
                              <TableHead className="text-slate-400">Last sign-in</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allUsersData?.users.map((u) => (
                              <TableRow key={u.id} className="border-white/10">
                                <TableCell className="text-slate-400 font-mono text-xs">{u.id}</TableCell>
                                <TableCell className="text-slate-400 text-xs max-w-[140px] truncate font-mono">
                                  {u.openId ?? "—"}
                                </TableCell>
                                <TableCell className="text-slate-200">{u.name ?? "—"}</TableCell>
                                <TableCell className="text-slate-300 text-xs max-w-[160px] truncate">{u.email ?? "—"}</TableCell>
                                <TableCell className="text-slate-300 text-xs">{u.phone ?? "—"}</TableCell>
                                <TableCell className="text-slate-300 text-xs">{u.role}</TableCell>
                                <TableCell className="text-slate-400 text-xs">{u.loginMethod ?? "—"}</TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                                  {new Date(u.createdAt).toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                                  {u.updatedAt ? new Date(u.updatedAt).toLocaleString("en-IN") : "—"}
                                </TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                                  {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString("en-IN") : "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {!loadingAllUsers && !allUsersData?.users.length && (
                      <p className="text-center text-slate-500 py-12 text-sm">No users match these filters.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === "events" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Listed events</h2>
                <Card className="bg-slate-900/60 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-slate-400">Search</Label>
                      <Input
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Title, location, club…"
                        className="bg-slate-950 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Club ID</Label>
                      <Input
                        value={eventClubId}
                        onChange={(e) => setEventClubId(e.target.value)}
                        placeholder="Numeric club id"
                        className="bg-slate-950 border-white/10 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Open to guests</Label>
                      <Select value={eventOpen} onValueChange={(v) => setEventOpen(v as typeof eventOpen)}>
                        <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Open</SelectItem>
                          <SelectItem value="no">Members only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 lg:col-span-2">
                      <Label className="text-xs text-slate-400">Time</Label>
                      <Select
                        value={eventTimeRange}
                        onValueChange={(v) => setEventTimeRange(v as typeof eventTimeRange)}
                      >
                        <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All dates</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{adminEvents?.total ?? 0} events match</p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={eventPage <= 1}
                      onClick={() => setEventPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {eventPage} / {eventTotalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/15"
                      disabled={eventPage >= eventTotalPages}
                      onClick={() => setEventPage((p) => Math.min(eventTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <Card className="bg-slate-900/60 border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    {loadingEvents ? (
                      <Skeleton className="h-40 m-4 bg-slate-800" />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              <TableHead className="text-slate-400">ID</TableHead>
                              <TableHead className="text-slate-400">Title</TableHead>
                              <TableHead className="text-slate-400">Club</TableHead>
                              <TableHead className="text-slate-400">When (UTC)</TableHead>
                              <TableHead className="text-slate-400">Open</TableHead>
                              <TableHead className="text-slate-400">Location</TableHead>
                              <TableHead className="text-slate-400">Max</TableHead>
                              <TableHead className="text-slate-400">Club ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminEvents?.events.map((ev) => (
                              <TableRow key={ev.id} className="border-white/10">
                                <TableCell className="text-slate-400 font-mono text-xs">{ev.id}</TableCell>
                                <TableCell className="text-slate-100 text-sm max-w-[200px]">{ev.title}</TableCell>
                                <TableCell className="text-slate-300 text-xs">
                                  <Link href={`/clubs/${ev.clubSlug}`} className="text-amber-400/90 hover:underline">
                                    {ev.clubName}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                                  {new Date(ev.datetimeUtc).toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-slate-300 text-xs">{ev.isOpen ? "Yes" : "No"}</TableCell>
                                <TableCell className="text-slate-400 text-xs max-w-[160px] truncate">
                                  {ev.locationName ?? "—"}
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs">{ev.maxParticipants ?? "—"}</TableCell>
                                <TableCell className="text-slate-500 font-mono text-xs">{ev.clubId}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {!loadingEvents && !adminEvents?.events.length && (
                      <p className="text-center text-slate-500 py-12 text-sm">No events match these filters.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === "analytics" && (
              <Card className="bg-slate-900/60 border-white/10 max-w-lg">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Product analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  {loadingAnalytics ? (
                    <Skeleton className="h-24 bg-slate-800" />
                  ) : analytics ? (
                    <>
                      <p>Page views recorded: {analytics.pageViews}</p>
                      <p>Outbound link clicks: {analytics.outboundClicks}</p>
                      <p>Search events: {analytics.searches}</p>
                    </>
                  ) : (
                    <p className="text-slate-500">No analytics data.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>Reject club</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-400">
              Rejecting <span className="text-white font-medium">{rejectTarget?.name}</span>. Reason required.
            </p>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Reason</Label>
              <Textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="bg-slate-950 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/15" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectNote.length < 5 || rejectMutation.isPending}
              onClick={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote })}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
