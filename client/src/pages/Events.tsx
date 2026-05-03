import { trpc } from "@/lib/trpc";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "../components/ui/skeleton";
import EmptyState from "../components/clubs/EmptyState";

export default function Events() {
  const { data: events, isLoading } = trpc.events.upcoming.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-[#1a1a1a] bg-[#111111] py-16 md:py-24">
        <div className="container">
          <div className="mb-3 flex items-center gap-3">
            <Calendar className="size-6 text-primary" />
            <p className="section-label m-0">// Operations</p>
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground sm:text-5xl md:text-6xl">
            Upcoming <span className="text-primary">events</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#aaaaaa] md:text-[16px]">
            Open sessions, races, and meetups from Treadgram clubs across India.
          </p>
        </div>
      </div>

      <div className="container py-16 md:py-20">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none border border-[#222222]" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-1">
            {events.map((event) => {
              const dt = new Date(event.datetimeUtc);
              return (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <div className="flex flex-col gap-4 border border-[#222222] bg-[#141414] p-5 transition-[filter,border-color] hover:border-primary sm:flex-row sm:items-stretch">
                    <div className="flex h-16 w-full shrink-0 flex-col items-center justify-center border border-[#222222] bg-[#0a0a0a] font-display text-primary sm:h-auto sm:w-20">
                      <span className="text-2xl font-black leading-none">
                        {dt.toLocaleDateString("en-IN", { day: "2-digit" })}
                      </span>
                      <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                        {dt.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {event.isOpen && (
                            <span className="border border-emerald-800 bg-emerald-950/40 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">
                              Open to all
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {event.locationName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {event.locationName}
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-3 line-clamp-2 text-[15px] text-[#aaaaaa]">{event.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No upcoming events"
            description="Check back soon or browse clubs to see their schedules."
            action={{ label: "Browse clubs", href: "/explore" }}
          />
        )}
      </div>
    </div>
  );
}
