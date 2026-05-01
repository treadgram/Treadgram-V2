import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function SystemAdminLogin() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.systemAdminLogin.useMutation({
    onSuccess: async () => {
      toast.success("Signed in to owner console");
      await utils.auth.me.invalidate();
      navigate("/system");
    },
    onError: (err) => {
      setError(err.message);
      toast.error(err.message);
    },
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    await loginMutation.mutateAsync({ email, password });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Owner console</h1>
            <p className="text-sm text-slate-400">System admin — not the public site login</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sys-email" className="text-slate-200">
              Email
            </Label>
            <Input
              id="sys-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950/50 border-white/10 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sys-pass" className="text-slate-200">
              Password
            </Label>
            <Input
              id="sys-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950/50 border-white/10 text-white"
              required
              minLength={8}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Enter console"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/" className="text-slate-400 underline underline-offset-2 hover:text-white">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
