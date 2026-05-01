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
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center max-w-5xl mx-auto">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Trophy className="w-4 h-4" />
              Join Treadgram
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
              Sign up with email and password. You can explore clubs right away, submit new ones,
              and claim listings you run.
            </p>
            <ul className="space-y-4 pt-2">
              {perks.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-card border flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground leading-snug">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm max-w-md mx-auto lg:ml-auto lg:mr-0 w-full">
              <h2 className="text-xl font-semibold mb-1">Sign up</h2>
              <p className="text-sm text-muted-foreground mb-6">
                All fields marked with * are required.
              </p>

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

              <p className="text-sm text-muted-foreground mt-6 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium underline underline-offset-2">
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
