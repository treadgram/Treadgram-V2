import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Signed in");
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

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail && !trimmedPhone) {
      setError("Enter your email or phone number");
      return;
    }

    await loginMutation.mutateAsync({
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
      password,
    });
  };

  return (
    <div className="container max-w-md py-16 md:py-24">
      <div className="border border-[#222222] bg-[#141414] p-8">
        <p className="section-label mb-3">// Access</p>
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.02em] text-foreground">Sign in</h1>
        <p className="mb-8 mt-3 text-[15px] text-[#aaaaaa]">
          Use your email or phone number with the password you chose at signup.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (if you sign in with phone)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Provide either email or phone (not both required).
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "/api/auth/supabase/google";
            }}
          >
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-[15px] text-[#888888]">
          New here?{" "}
          <Link href="/signup" className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary hover:opacity-90">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
