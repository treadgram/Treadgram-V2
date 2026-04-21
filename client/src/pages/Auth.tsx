import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const mode: Mode = location.includes("/signup") ? "signup" : "login";

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: () => navigate("/"),
    onError: (err) => setError(err.message),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => navigate("/"),
    onError: (err) => setError(err.message),
  });

  const isPending = signupMutation.isPending || loginMutation.isPending;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "signup") {
      await signupMutation.mutateAsync({
        email,
        password,
        confirmPassword,
      });
      return;
    }

    await loginMutation.mutateAsync({
      email: email || undefined,
      phone: phone || undefined,
      password,
    });
  };

  return (
    <div className="container py-12 max-w-md">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signup"
            ? "Sign up with email and password."
            : "Sign in using email or phone number plus password."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required={mode === "signup"}
            />
          </div>

          {mode === "login" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (login only)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-4">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={mode === "signup" ? "/auth/login" : "/auth/signup"}
            className="text-primary underline"
          >
            {mode === "signup" ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
