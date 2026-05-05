import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import axios from "axios";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRequestOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0]?.trim() ??
    req.protocol;
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.get("host");
  return `${proto}://${host}`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/auth/supabase/google", (req: Request, res: Response) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      res.status(500).json({ error: "SUPABASE_URL is not configured" });
      return;
    }

    const callbackUrl = `${getRequestOrigin(req)}/auth/supabase/callback`;
    const redirectUrl = new URL("/auth/v1/authorize", supabaseUrl);
    redirectUrl.searchParams.set("provider", "google");
    redirectUrl.searchParams.set("redirect_to", callbackUrl);
    redirectUrl.searchParams.set("scopes", "email profile");
    res.redirect(302, redirectUrl.toString());
  });

  app.post("/auth/supabase/session", async (req: Request, res: Response) => {
    const accessToken = req.body?.accessToken;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: "SUPABASE_URL and SUPABASE_ANON_KEY must be configured" });
      return;
    }
    if (typeof accessToken !== "string" || accessToken.length === 0) {
      res.status(400).json({ error: "accessToken is required" });
      return;
    }

    try {
      const userRes = await axios.get(new URL("/auth/v1/user", supabaseUrl).toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseAnonKey,
          Accept: "application/json",
        },
      });
      const user = userRes.data as {
        id: string;
        email?: string | null;
        user_metadata?: Record<string, unknown>;
        app_metadata?: Record<string, unknown>;
      };

      const openId = `supabase_${user.id}`;
      const name =
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
        (typeof user.email === "string" ? user.email.split("@")[0] : "User");
      const loginMethod =
        (typeof user.app_metadata?.provider === "string" && user.app_metadata.provider) || "google";

      await db.upsertUser({
        openId,
        name,
        email: user.email ?? null,
        loginMethod,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[OAuth] Supabase session creation failed", error);
      res.status(500).json({ error: "Supabase auth failed" });
    }
  });

  app.get("/auth/github", (req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: "GITHUB_CLIENT_ID is not configured" });
      return;
    }

    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL || `${getRequestOrigin(req)}/auth/github/callback`;
    const redirectUrl = new URL("https://github.com/login/oauth/authorize");
    redirectUrl.searchParams.set("client_id", clientId);
    redirectUrl.searchParams.set("redirect_uri", callbackUrl);
    redirectUrl.searchParams.set("scope", "read:user user:email");

    res.redirect(302, redirectUrl.toString());
  });

  app.get("/auth/github/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }
    if (!clientId || !clientSecret) {
      res
        .status(500)
        .json({ error: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured" });
      return;
    }

    try {
      const callbackUrl =
        process.env.GITHUB_CALLBACK_URL || `${getRequestOrigin(req)}/auth/github/callback`;
      const payload = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      });
      const tokenRes = await axios.post("https://github.com/login/oauth/access_token", payload, {
        headers: { Accept: "application/json" },
      });
      const accessToken = tokenRes.data?.access_token as string | undefined;
      if (!accessToken) {
        res.status(400).json({ error: "GitHub token exchange failed" });
        return;
      }

      const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      });
      const user = userRes.data as {
        id: number;
        login: string;
        name?: string | null;
        email?: string | null;
      };
      let email: string | null = user.email ?? null;
      if (!email) {
        const emailRes = await axios.get("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        });
        const emails = emailRes.data as Array<{ email: string; primary: boolean; verified: boolean }>;
        email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null;
      }

      const openId = `github_${user.id}`;
      const name = user.name?.trim() || user.login;
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        // OAuth redirect callback is same-site navigation and works better with Lax.
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] GitHub callback failed", error);
      res.status(500).json({ error: "GitHub OAuth callback failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
