import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isProd = process.env.NODE_ENV === "production";
  // SameSite=None requires Secure; behind Vercel's proxy req.protocol can be "http" even for HTTPS clients.
  if (isProd) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    };
  }

  // Local dev over http: Lax + optional Secure avoids browsers dropping the session cookie.
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
