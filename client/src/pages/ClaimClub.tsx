import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Flag } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

interface ClaimClubProps {
  params: { slug: string };
}

export default function ClaimClub({ params }: ClaimClubProps) {
  const { slug } = params;
  const { isAuthenticated, loading } = useAuth();
  const [proofText, setProofText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: club, isLoading } = trpc.clubs.getBySlug.useQuery({ slug });

  const claimMutation = trpc.claims.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e.message),
  });

  if (loading || isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-4 w-full max-w-md border-[#222222] bg-[#141414]">
          <CardContent className="px-8 pb-10 pt-10 text-center">
            <Flag className="mx-auto mb-4 size-12 text-primary" />
            <p className="section-label mb-2">// Access</p>
            <h2 className="font-display text-xl font-black uppercase tracking-wide text-foreground">Sign in to claim</h2>
            <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">You need to be signed in to claim ownership of a club.</p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Club Not Found</h1>
        <Button asChild><Link href="/explore">Browse Clubs</Link></Button>
      </div>
    );
  }

  if (club.ownedBy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-4 w-full max-w-md border-[#222222] bg-[#141414]">
          <CardContent className="px-8 pb-10 pt-10 text-center">
            <CheckCircle className="mx-auto mb-4 size-12 text-primary" />
            <p className="section-label mb-2">// Status</p>
            <h2 className="font-display text-xl font-black uppercase tracking-wide text-foreground">Already claimed</h2>
            <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">
              This club already has an owner. If you believe this is incorrect, please contact support.
            </p>
            <Button asChild variant="outline" className="border-white">
              <Link href={`/clubs/${slug}`}>Back to Club</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-4 w-full max-w-md border-[#222222] bg-[#141414]">
          <CardContent className="px-8 pb-10 pt-10 text-center">
            <CheckCircle className="mx-auto mb-4 size-12 text-primary" />
            <p className="section-label mb-2">// Status</p>
            <h2 className="font-display text-xl font-black uppercase tracking-wide text-foreground">Claim submitted</h2>
            <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">
              Your claim for <strong>{club.name}</strong> has been submitted. Our moderators will review it within 1–2 business days.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 border-white">
                <Link href={`/clubs/${slug}`}>Back to Club</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/my-clubs">My Clubs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 md:py-20">
      <div className="container max-w-lg">
        <div className="mb-8">
          <Link
            href={`/clubs/${slug}`}
            className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888] hover:text-primary"
          >
            ← Back to {club.name}
          </Link>
        </div>

        <Card className="border-[#222222] bg-[#141414]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center border border-primary/40 bg-[#0a0a0a]">
                <Flag className="size-5 text-primary" />
              </div>
              <div>
                <p className="section-label mb-1">// Claim</p>
                <CardTitle className="font-display text-xl font-black uppercase tracking-wide text-foreground">
                  Claim {club.name}
                </CardTitle>
                <p className="mt-1 text-[14px] text-[#aaaaaa]">Prove you&apos;re the organiser to take ownership</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 border border-[#222222] bg-[#111111] p-4 text-[14px] text-[#aaaaaa]">
              <p className="font-medium text-foreground">What happens after claiming?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Our moderators will verify your claim</li>
                <li>Once approved, you can edit club details</li>
                <li>You can add sessions, events, and photos</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proof">Proof of Association <span className="text-destructive">*</span></Label>
              <Textarea
                id="proof"
                placeholder="Describe your role in this club. Include your contact details, how long you've been involved, and any verifiable information (e.g. Instagram handle, website, etc.)..."
                rows={5}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum 20 characters. Be as specific as possible.</p>
            </div>

            <Button
              className="w-full"
              disabled={proofText.length < 20 || claimMutation.isPending}
              onClick={() => claimMutation.mutate({ clubId: club.id, proofText })}
            >
              {claimMutation.isPending ? "Submitting..." : "Submit Claim"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
