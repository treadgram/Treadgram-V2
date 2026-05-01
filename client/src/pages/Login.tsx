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
    <div className="container py-12 max-w-md">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">
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
        </form>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          New here?{" "}
          <Link href="/signup" className="text-primary font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
