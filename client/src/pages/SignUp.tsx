import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Trophy, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const perks = [
  {
    icon: Trophy,
    title: "Claim your club",
    body: "Verify ownership and manage your listing after signup.",
  },
  {
    icon: Users,
    title: "Reviews & events",
    body: "Share experiences and post meetups for your community.",
  },
  {
    icon: MapPin,
    title: "Nationwide",
    body: "One Treadgram account for discovering clubs in every city we cover.",
  },
];

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      toast.success("Welcome to Treadgram!");
      await utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => {
      setError(err.message);
      toast.error(err.message);
    },
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    await signupMutation.mutateAsync({
      name,
      email,
      phone: phone.trim() ? phone.trim() : undefined,
      password,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="container py-16 lg:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 space-y-8 lg:order-1">
            <div>
              <p className="section-label mb-3">// Onboarding</p>
              <div className="mb-4 inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                <Trophy className="size-4" />
                Join Treadgram
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground sm:text-5xl">
                Create your <span className="text-primary">account</span>
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#aaaaaa]">
                Sign up with email and password. Explore clubs immediately, submit new listings, and claim crews you run.
              </p>
            </div>
            <ul className="space-y-5 pt-2">
              {perks.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center border border-[#222222] bg-[#141414]">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">{title}</p>
                    <p className="mt-1 text-[14px] leading-snug text-[#aaaaaa]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 w-full max-w-md mx-auto lg:order-2 lg:ml-auto lg:mr-0">
            <div className="border border-[#222222] bg-[#141414] p-6 sm:p-8">
              <p className="section-label mb-2">// Form</p>
              <h2 className="font-display text-2xl font-black uppercase tracking-wide text-foreground">Sign up</h2>
              <p className="mb-8 mt-2 text-[14px] text-[#888888]">All fields marked with * are required.</p>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name *</Label>
                  <Input
                    id="signup-name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm password *</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={8}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? "Creating account…" : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-[15px] text-[#888888]">
                Already have an account?{" "}
                <Link href="/login" className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary hover:opacity-90">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
