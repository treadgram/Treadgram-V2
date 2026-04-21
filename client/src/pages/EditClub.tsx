import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calendar, CheckCircle, Clock, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { z } from "zod";
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
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { CITIES, SPORTS, DAYS_OF_WEEK } from "../../../shared/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const schema = z.object({
  name: z.string().min(3).max(256),
  description: z.string().optional(),
  shortDescription: z.string().max(280).optional(),
  beginnerFriendly: z.boolean(),
  pricingType: z.enum(["free", "paid", "donation"]),
  monthlyFeeInr: z.number().int().nonnegative().optional(),
  address: z.string().optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  whatsappUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const sessionSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().optional(),
  locationName: z.string().optional(),
  notes: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(3),
  datetimeUtc: z.string().min(1),
  locationName: z.string().optional(),
  description: z.string().optional(),
  isOpen: z.boolean(),
  registrationUrl: z.string().url().optional().or(z.literal("")),
});

interface EditClubProps {
  params: { id: string };
}

export default function EditClub({ params }: EditClubProps) {
  const clubId = parseInt(params.id, 10);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: myClubsList, isLoading } = trpc.clubs.myClubs.useQuery(undefined, { enabled: isAuthenticated });
  const clubData = myClubsList?.find((c) => c.id === clubId);
  const { data: sessions } = trpc.sessions.listByClub.useQuery({ clubId }, { enabled: !!clubId });
  const { data: events } = trpc.events.upcoming.useQuery({ clubId, limit: 50 }, { enabled: !!clubId });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (clubData) {
      const club = clubData;
      reset({
        name: club.name,
        description: club.description ?? "",
        shortDescription: club.shortDescription ?? "",
        beginnerFriendly: club.beginnerFriendly,
        pricingType: club.pricingType as "free" | "paid" | "donation",
        monthlyFeeInr: club.monthlyFeeInr ?? undefined,
        address: club.address ?? "",
        instagramUrl: club.instagramUrl ?? "",
        whatsappUrl: club.whatsappUrl ?? "",
        websiteUrl: club.websiteUrl ?? "",
      });
    }
  }, [clubData, reset]);

  const updateMutation = trpc.clubs.update.useMutation({
    onSuccess: () => {
      toast.success("Club updated successfully!");
      utils.clubs.myClubs.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const addSessionMutation = trpc.sessions.create.useMutation({
    onSuccess: () => {
      toast.success("Session added!");
      utils.sessions.listByClub.invalidate({ clubId });
      setNewSession({ dayOfWeek: 0, startTime: "", endTime: "", locationName: "", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSessionMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      toast.success("Session removed.");
      utils.sessions.listByClub.invalidate({ clubId: clubId });
    },
    onError: (e) => toast.error(e.message),
  });

  const addEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event added!");
      utils.events.upcoming.invalidate({ clubId });
      setNewEvent({ title: "", datetimeUtc: "", locationName: "", description: "", isOpen: true, registrationUrl: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event removed.");
      utils.events.upcoming.invalidate({ clubId });
    },
    onError: (e) => toast.error(e.message),
  });

  const [newSession, setNewSession] = useState({
    dayOfWeek: 0, startTime: "", endTime: "", locationName: "", notes: "",
  });
  const [newEvent, setNewEvent] = useState({
    title: "", datetimeUtc: "", locationName: "", description: "", isOpen: true, registrationUrl: "",
  });

  const pricingType = watch("pricingType");
  const club = clubData;
  if (isLoading && !club) return null;

  if (!club) return (
    <div className="container py-20 text-center">
      <h1 className="font-display text-2xl font-bold mb-2">Club Not Found</h1>
      <Button asChild><Link href="/my-clubs">My Clubs</Link></Button>
    </div>
  );

  // Authorization check
  if (isAuthenticated && user?.id !== club.ownedBy) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to edit this club.</p>
        <Button asChild><Link href="/my-clubs">My Clubs</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-3xl">
        <div className="mb-6">
          <Link href="/my-clubs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> My Clubs
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Edit: {club.name}</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clubs/${club.slug}`}>View Public Page</Link>
          </Button>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Club Details</TabsTrigger>
            <TabsTrigger value="sessions">Schedule</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* ── Details Tab ── */}
          <TabsContent value="details">
            <form onSubmit={handleSubmit((data) => club && updateMutation.mutate({ id: clubId, city: club.city, cityLabel: club.cityLabel, sport: club.sport, sportLabel: club.sportLabel, ...data }))}>
              <Card className="shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-1.5">
                    <Label>Club Name</Label>
                    <Input {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Short Description</Label>
                    <Input placeholder="One-line summary (max 280 chars)" {...register("shortDescription")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Full Description</Label>
                    <Textarea rows={4} {...register("description")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Pricing Type</Label>
                    <Select value={pricingType} onValueChange={(v: "free" | "paid" | "donation") => setValue("pricingType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="donation">Donation-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {pricingType === "paid" && (
                    <div className="space-y-1.5">
                      <Label>Monthly Fee (₹)</Label>
                      <Input type="number" {...register("monthlyFeeInr", { valueAsNumber: true })} />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <Label className="cursor-pointer">Beginner Friendly</Label>
                    <Switch
                      checked={watch("beginnerFriendly")}
                      onCheckedChange={(v) => setValue("beginnerFriendly", v)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Address / Meeting Location</Label>
                    <Input {...register("address")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Instagram URL</Label>
                    <Input placeholder="https://instagram.com/yourclub" {...register("instagramUrl")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>WhatsApp Group Link</Label>
                    <Input placeholder="https://chat.whatsapp.com/..." {...register("whatsappUrl")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Website URL</Label>
                    <Input placeholder="https://yourclub.com" {...register("websiteUrl")} />
                  </div>

                  <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* ── Sessions Tab ── */}
          <TabsContent value="sessions">
            <Card className="shadow-sm mb-5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Add Weekly Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Day of Week</Label>
                    <Select
                      value={String(newSession.dayOfWeek)}
                      onValueChange={(v) => setNewSession({ ...newSession, dayOfWeek: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, i) => (
                          <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>End Time (optional)</Label>
                    <Input
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location Name</Label>
                    <Input
                      placeholder="e.g. Marina Beach"
                      value={newSession.locationName}
                      onChange={(e) => setNewSession({ ...newSession, locationName: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!newSession.startTime || addSessionMutation.isPending}
                  onClick={() => addSessionMutation.mutate({ clubId, ...newSession })}
                  className="gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Session
                </Button>
              </CardContent>
            </Card>

            {sessions && sessions.length > 0 && (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-sm text-foreground">{DAYS_OF_WEEK[s.dayOfWeek]}</span>
                      <span className="text-sm text-muted-foreground ml-2">{s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}</span>
                      {s.locationName && <span className="text-xs text-muted-foreground ml-2">· {s.locationName}</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => deleteSessionMutation.mutate({ id: s.id, clubId })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Events Tab ── */}
          <TabsContent value="events">
            <Card className="shadow-sm mb-5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Add Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Event Title</Label>
                  <Input
                    placeholder="e.g. Sunday 10K Run"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={newEvent.datetimeUtc}
                      onChange={(e) => setNewEvent({ ...newEvent, datetimeUtc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g. Cubbon Park"
                      value={newEvent.locationName}
                      onChange={(e) => setNewEvent({ ...newEvent, locationName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    placeholder="Brief description of the event..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <Label className="cursor-pointer">Open to all (non-members)</Label>
                  <Switch
                    checked={newEvent.isOpen}
                    onCheckedChange={(v) => setNewEvent({ ...newEvent, isOpen: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Registration URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newEvent.registrationUrl}
                    onChange={(e) => setNewEvent({ ...newEvent, registrationUrl: e.target.value })}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!newEvent.title || !newEvent.datetimeUtc || addEventMutation.isPending}
                  onClick={() => addEventMutation.mutate({
                    clubId,
                    ...newEvent,
                    datetimeUtc: new Date(newEvent.datetimeUtc),
                    registrationUrl: newEvent.registrationUrl || undefined,
                  })}
                  className="gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </Button>
              </CardContent>
            </Card>

            {events && events.length > 0 && (
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-sm text-foreground">{e.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(e.datetimeUtc).toLocaleDateString("en-IN")}
                      </span>
                      {e.isOpen && <span className="ml-2 text-xs text-green-600 font-medium">Open</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => deleteEventMutation.mutate({ id: e.id, clubId })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
