import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function OAuthConsentPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container max-w-md py-16 md:py-24">
      <div className="border border-[#222222] bg-[#141414] p-8">
        <p className="section-label mb-3">// Sign in</p>
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground">
          Continue with Google
        </h1>
        <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">
          We’ll redirect you to Google to sign in. Treadgram will only access your basic profile
          information (name and email) to create your account.
        </p>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              window.location.href = "/auth/supabase/google";
            }}
          >
            Continue
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

