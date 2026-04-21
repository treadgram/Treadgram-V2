import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
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
import { CITIES, SPORTS } from "../../../shared/constants";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(256),
  city: z.string().min(1, "Please select a city"),
  sport: z.string().min(1, "Please select a sport"),
  description: z.string().optional(),
  shortDescription: z.string().max(280).optional(),
  beginnerFriendly: z.boolean(),
  pricingType: z.enum(["free", "paid", "donation"]),
  monthlyFeeInr: z.number().int().nonnegative().optional(),
  address: z.string().optional(),
  instagramUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  whatsappUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Contact" },
];

export default function SubmitClub() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pricingType: "free", beginnerFriendly: false },
  });

  const pricingType = watch("pricingType");
  const cityValue = watch("city");
  const sportValue = watch("sport");

  const submitMutation = trpc.clubs.submit.useMutation({
    onSuccess: (data) => {
      setSubmittedSlug(data.slug);
      setSubmitted(true);
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (data: FormData) => {
    const cityInfo = CITIES.find((c) => c.key === data.city);
    const sportInfo = SPORTS.find((s) => s.key === data.sport);
    submitMutation.mutate({
      ...data,
      cityLabel: cityInfo?.label ?? data.city,
      sportLabel: sportInfo?.label ?? data.sport,
      instagramUrl: data.instagramUrl || undefined,
      whatsappUrl: data.whatsappUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
    });
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Sign In to Add Your Club</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account or sign in to submit your sports club to our directory.
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-14 h-14 text-accent mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Club Submitted!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your club has been submitted for review. Our moderators will approve it within 1–2 business days. You'll be able to manage it from your dashboard once approved.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/my-clubs">My Clubs</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/explore">Browse Clubs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Add Your Sports Club</h1>
          <p className="text-muted-foreground mt-1">List your club for free and connect with sports enthusiasts across India.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s.id ? "bg-accent text-accent-foreground" :
                step === s.id ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === s.id ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="shadow-sm">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Club Name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="e.g. Chennai Runners Club" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>City <span className="text-destructive">*</span></Label>
                      <Select value={cityValue} onValueChange={(v) => setValue("city", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {CITIES.map((c) => (
                            <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Sport <span className="text-destructive">*</span></Label>
                      <Select value={sportValue} onValueChange={(v) => setValue("sport", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORTS.map((s) => (
                            <SelectItem key={s.key} value={s.key}>{s.emoji} {s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sport && <p className="text-xs text-destructive">{errors.sport.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input id="shortDescription" placeholder="One-line summary (max 280 chars)" {...register("shortDescription")} />
                    {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea id="description" placeholder="Tell people about your club — what you do, when you meet, who can join..." rows={4} {...register("description")} />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Club Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Pricing Type</Label>
                    <Select value={pricingType} onValueChange={(v: "free" | "paid" | "donation") => setValue("pricingType", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free — no membership fee</SelectItem>
                        <SelectItem value="paid">Paid — fixed monthly fee</SelectItem>
                        <SelectItem value="donation">Donation-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {pricingType === "paid" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="monthlyFeeInr">Monthly Fee (₹)</Label>
                      <Input
                        id="monthlyFeeInr"
                        type="number"
                        placeholder="e.g. 500"
                        {...register("monthlyFeeInr", { valueAsNumber: true })}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">Beginner Friendly</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">New to the sport? All skill levels welcome.</p>
                    </div>
                    <Switch
                      checked={watch("beginnerFriendly")}
                      onCheckedChange={(v) => setValue("beginnerFriendly", v)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address">Meeting Location / Address</Label>
                    <Input id="address" placeholder="e.g. Marina Beach, Chennai" {...register("address")} />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Contact */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Contact & Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input id="instagramUrl" placeholder="https://instagram.com/yourclub" {...register("instagramUrl")} />
                    {errors.instagramUrl && <p className="text-xs text-destructive">{errors.instagramUrl.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappUrl">WhatsApp Group Link</Label>
                    <Input id="whatsappUrl" placeholder="https://chat.whatsapp.com/..." {...register("whatsappUrl")} />
                    {errors.whatsappUrl && <p className="text-xs text-destructive">{errors.whatsappUrl.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input id="websiteUrl" placeholder="https://yourclub.com" {...register("websiteUrl")} />
                    {errors.websiteUrl && <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>}
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
                    By submitting, your club will be reviewed by our moderators before appearing publicly. This usually takes 1–2 business days.
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 pt-0">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} className="gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitMutation.isPending} className="gap-2">
                  {submitMutation.isPending ? "Submitting..." : "Submit Club"}
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
