import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Calendar,
  Clock,
  ExternalLink,
  Flag,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { MapView } from "../components/Map";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { DAYS_OF_WEEK, SPORTS } from "../../../shared/constants";

interface ClubProfileProps {
  params: { slug: string };
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ClubProfile({ params }: ClubProfileProps) {
  const { slug } = params;
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: club, isLoading } = trpc.clubs.getBySlug.useQuery({ slug });
  const { data: sessions } = trpc.sessions.listByClub.useQuery(
    { clubId: club?.id ?? 0 },
    { enabled: !!club?.id }
  );
  const { data: events } = trpc.events.upcoming.useQuery(
    { clubId: club?.id, limit: 5 },
    { enabled: !!club?.id }
  );
  const { data: reviews } = trpc.reviews.listByClub.useQuery(
    { clubId: club?.id ?? 0 },
    { enabled: !!club?.id }
  );
  const { data: myReview } = trpc.reviews.myReview.useQuery(
    { clubId: club?.id ?? 0 },
    { enabled: !!club?.id && isAuthenticated }
  );

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const submitReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewRating(0);
      setReviewComment("");
      utils.reviews.listByClub.invalidate({ clubId: club!.id });
      utils.clubs.getBySlug.invalidate({ slug });
    },
    onError: (e) => toast.error(e.message),
  });

  const trackClick = trpc.analytics.track.useMutation();

  const handleOutboundClick = (target: "instagram" | "whatsapp" | "website") => {
    if (club) {
      trackClick.mutate({ eventType: "outbound_click", target, clubId: club.id });
    }
  };

  if (isLoading) return <ClubProfileSkeleton />;
  if (!club) return (
    <div className="container py-20 text-center">
      <h1 className="font-display text-2xl font-bold mb-2">Club Not Found</h1>
      <p className="text-muted-foreground mb-6">This club doesn't exist or has been removed.</p>
      <Button asChild><Link href="/explore">Browse Clubs</Link></Button>
    </div>
  );

  const sportInfo = SPORTS.find((s) => s.key === club.sport);
  const isOwner = user?.id === club.ownedBy;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-56 sm:h-72 bg-gradient-to-br from-secondary to-muted overflow-hidden">
        {club.coverImageUrl ? (
          <img src={club.coverImageUrl} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-10">{sportInfo?.emoji ?? "🏅"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="container -mt-12 relative pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Club header card */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{sportInfo?.emoji ?? "🏅"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h1 className="font-display text-2xl font-bold text-foreground">{club.name}</h1>
                          {club.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                              <BadgeCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {club.cityLabel}
                          </span>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", sportInfo?.color ?? "bg-gray-100 text-gray-700")}>
                            {sportInfo?.emoji} {club.sportLabel}
                          </span>
                          {club.reviewCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {Number(club.avgRating).toFixed(1)} ({club.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isOwner && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/my-clubs/${club.id}/edit`}>Edit Club</Link>
                          </Button>
                        )}
                        {!club.ownedBy && isAuthenticated && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/clubs/${slug}/claim`}>Claim Club</Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied!");
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full",
                        club.pricingType === "free" ? "bg-green-100 text-green-700" :
                        club.pricingType === "paid" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      )}>
                        {club.pricingType === "free" ? "Free" : club.pricingType === "paid" ? `₹${club.monthlyFeeInr ?? "Paid"}/mo` : "Donation-based"}
                      </span>
                      {club.beginnerFriendly && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
                          Beginner Friendly
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {club.description && (
                  <div className="mt-5 pt-5 border-t border-border">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{club.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            {sessions && sessions.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Weekly Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="w-20 shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {DAYS_OF_WEEK[session.dayOfWeek]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}
                          </div>
                          {session.locationName && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {session.locationName}
                            </div>
                          )}
                          {session.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{session.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            {events && events.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {new Date(event.datetimeUtc).toLocaleDateString("en-IN", { day: "2-digit" })}
                          </span>
                          <span className="text-xs text-primary/70">
                            {new Date(event.datetimeUtc).toLocaleDateString("en-IN", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(event.datetimeUtc).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            {event.locationName && ` · ${event.locationName}`}
                          </div>
                          {event.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {event.isOpen && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                Open to All
                              </span>
                            )}
                            {event.registrationUrl && (
                              <a
                                href={event.registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                Register <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Reviews
                  {club.reviewCount > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({club.reviewCount})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Write review */}
                {isAuthenticated && !myReview ? (
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">Write a Review</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn("w-6 h-6 transition-colors", (hoverRating || reviewRating) >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                            )}
                          />
                        </button>
                      ))}
                      {(hoverRating || reviewRating) > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground self-center">
                          {RATING_LABELS[hoverRating || reviewRating]}
                        </span>
                      )}
                    </div>
                    <Textarea
                      placeholder="Share your experience with this club..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      disabled={reviewRating === 0 || submitReview.isPending}
                      onClick={() => submitReview.mutate({ clubId: club.id, rating: reviewRating, comment: reviewComment })}
                    >
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Sign in to leave a review</p>
                    <Button size="sm" asChild>
                      <a href={getLoginUrl()}>Sign In</a>
                    </Button>
                  </div>
                ) : null}

                {/* Review list */}
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4 divide-y divide-border">
                    {reviews.map((review) => (
                      <div key={review.id} className="pt-4 first:pt-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {review.userName?.charAt(0)?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{review.userName ?? "Anonymous"}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {club.instagramUrl && (
                  <a
                    href={club.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleOutboundClick("instagram")}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Instagram</div>
                      <div className="text-xs text-muted-foreground truncate">Follow for updates</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {club.whatsappUrl && (
                  <a
                    href={club.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleOutboundClick("whatsapp")}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
                      <MessageCircle className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">WhatsApp Group</div>
                      <div className="text-xs text-muted-foreground">Join the community</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {club.websiteUrl && (
                  <a
                    href={club.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleOutboundClick("website")}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Globe className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Website</div>
                      <div className="text-xs text-muted-foreground truncate">{club.websiteUrl.replace(/^https?:\/\//, "")}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {!club.instagramUrl && !club.whatsappUrl && !club.websiteUrl && (
                  <p className="text-sm text-muted-foreground text-center py-2">No contact links added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            {club.lat && club.lng && (
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-52">
                    <MapView
                      onMapReady={(map) => {
                        const position = { lat: club.lat!, lng: club.lng! };
                        new google.maps.Marker({ position, map, title: club.name });
                        map.setCenter(position);
                        map.setZoom(15);
                      }}
                    />
                  </div>
                  {club.address && (
                    <div className="p-3 text-xs text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      {club.address}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick info */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Club Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Sport" value={`${sportInfo?.emoji ?? ""} ${club.sportLabel}`} />
                <InfoRow label="City" value={club.cityLabel} />
                <InfoRow label="Pricing" value={club.pricingType === "free" ? "Free" : club.pricingType === "paid" ? `₹${club.monthlyFeeInr ?? "?"}/month` : "Donation-based"} />
                <InfoRow label="Beginner Friendly" value={club.beginnerFriendly ? "Yes" : "No"} />
                <InfoRow label="Listed Since" value={new Date(club.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function ClubProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-72 w-full" />
      <div className="container -mt-12 relative pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
