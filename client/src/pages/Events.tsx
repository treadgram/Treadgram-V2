import { trpc } from "@/lib/trpc";
import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "../components/ui/skeleton";
import EmptyState from "../components/clubs/EmptyState";

export default function Events() {
  const { data: events, isLoading } = trpc.events.upcoming.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-10">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Upcoming Events</h1>
          </div>
          <p className="text-muted-foreground">Open sessions, races, and meetups from clubs across India</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => {
              const dt = new Date(event.datetimeUtc);
              return (
                <div
                  key={event.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0 text-primary">
                    <span className="text-xl font-bold leading-none">
                      {dt.toLocaleDateString("en-IN", { day: "2-digit" })}
                    </span>
                    <span className="text-xs font-semibold uppercase">
                      {dt.toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-base text-foreground">{event.title}</h3>
                      <div className="flex items-center gap-2">
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
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            Register <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {event.locationName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.locationName}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No upcoming events"
            description="Check back soon or browse clubs to see their schedules."
            action={{ label: "Browse Clubs", href: "/explore" }}
          />
        )}
      </div>
    </div>
  );
}
