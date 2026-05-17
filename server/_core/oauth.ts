import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { WorkOS } from "@workos-inc/node";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

type RequestLike = {
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  protocol: string;
  get(name: string): string | undefined;
};

type ResponseLike = {
  status(code: number): ResponseLike;
  json(body: unknown): void;
  redirect(statusCode: number, url: string): void;
  cookie(name: string, value: string, options: Record<string, unknown>): void;
};

type AppLike = {
  get(path: string, handler: (req: RequestLike, res: ResponseLike) => void | Promise<void>): void;
};

function getRequestOrigin(req: RequestLike): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0]?.trim() ??
    req.protocol;
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.get("host");
  return `${proto}://${host}`;
}

function getQueryParam(req: RequestLike, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

let workosClient: WorkOS | null = null;
function getWorkos(): WorkOS {
  if (!workosClient) workosClient = new WorkOS(ENV.workosApiKey);
  return workosClient;
}

function resolveRedirectUri(req: RequestLike): string {
  return ENV.workosRedirectUri || `${getRequestOrigin(req)}/api/auth/workos/callback`;
}

export function registerOAuthRoutes(app: AppLike) {
  app.get("/api/auth/workos/start", (req: RequestLike, res: ResponseLike) => {
    if (!ENV.workosApiKey || !ENV.workosClientId) {
      res.status(500).json({ error: "WORKOS_API_KEY and WORKOS_CLIENT_ID must be configured" });
      return;
    }
    const authorizationUrl = getWorkos().userManagement.getAuthorizationUrl({
      provider: "authkit",
      clientId: ENV.workosClientId,
      redirectUri: resolveRedirectUri(req),
    });
    res.redirect(302, authorizationUrl);
  });

  app.get("/api/auth/workos/callback", async (req: RequestLike, res: ResponseLike) => {
    const code = getQueryParam(req, "code");
    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }
    if (!ENV.workosApiKey || !ENV.workosClientId) {
      res.status(500).json({ error: "WORKOS_API_KEY and WORKOS_CLIENT_ID must be configured" });
      return;
    }

    try {
      const { user } = await getWorkos().userManagement.authenticateWithCode({
        code,
        clientId: ENV.workosClientId,
      });

      const openId = `workos_${user.id}`;
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.email.split("@")[0];
      const adminEmail = ENV.systemAdminEmail.trim().toLowerCase();
      const isOwner = adminEmail.length > 0 && user.email.trim().toLowerCase() === adminEmail;

      await db.upsertUser({
        openId,
        name,
        email: user.email,
        loginMethod: "workos",
        lastSignedIn: new Date(),
        ...(isOwner ? { role: "admin" as const } : {}),
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
      res.redirect(302, isOwner ? "/system" : "/");
    } catch (error) {
      console.error("[OAuth] WorkOS callback failed", error);
      res.status(500).json({ error: "WorkOS auth failed" });
    }
  });
}
