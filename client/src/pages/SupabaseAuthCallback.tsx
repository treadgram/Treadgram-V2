import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function getAccessTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const fromHash = hashParams.get("access_token");
  if (fromHash) return fromHash;

  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get("access_token");
}

function getOAuthErrorFromUrl(): string | null {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const hashError = hashParams.get("error_description") || hashParams.get("error");
  if (hashError) return hashError;

  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get("error_description") || queryParams.get("error");
}

export default function SupabaseAuthCallbackPage() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const oauthError = getOAuthErrorFromUrl();
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const accessToken = getAccessTokenFromUrl();
      if (!accessToken) {
        setError(
          "Missing access token from Supabase callback. Check Supabase redirect URL settings and retry."
        );
        return;
      }

      try {
        // Scrub tokens from URL as soon as we read them.
        window.history.replaceState({}, document.title, "/auth/supabase/callback");
        const res = await fetch("/api/auth/supabase/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to establish app session");
        }
        if (!cancelled) navigate("/");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Authentication failed");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="container max-w-md py-16 md:py-24">
      <div className="border border-[#222222] bg-[#141414] p-8">
        <h1 className="font-display text-2xl font-black uppercase tracking-[-0.02em] text-foreground">
          Signing you in
        </h1>
        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Finalizing your session, please wait...
          </p>
        )}
      </div>
    </div>
  );
}
