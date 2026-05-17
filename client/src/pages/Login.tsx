import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="container max-w-md py-16 md:py-24">
      <div className="border border-[#222222] bg-[#141414] p-8">
        <p className="section-label mb-3">// Access</p>
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground">
          Sign in
        </h1>
        <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">
          Continue with email or Google. New accounts are created automatically on first sign-in.
        </p>

        <Button
          type="button"
          className="w-full"
          onClick={() => {
            window.location.href = "/api/auth/workos/start";
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
