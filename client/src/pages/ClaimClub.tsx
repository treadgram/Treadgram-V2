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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <Flag className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Sign In to Claim Club</h2>
            <p className="text-muted-foreground text-sm mb-6">You need to be signed in to claim ownership of a club.</p>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Club Already Claimed</h2>
            <p className="text-muted-foreground text-sm mb-6">This club already has an owner. If you believe this is incorrect, please contact us.</p>
            <Button asChild variant="outline">
              <Link href={`/clubs/${slug}`}>Back to Club</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Claim Submitted!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your claim for <strong>{club.name}</strong> has been submitted. Our moderators will review it within 1–2 business days.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
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
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-lg">
        <div className="mb-6">
          <Link href={`/clubs/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to {club.name}
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Claim {club.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Prove you're the organiser to take ownership</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground space-y-2">
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
