import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";

let vercelBootLogged = false;

/** Express app with API routes only (tRPC, OAuth). Use on Vercel serverless; static HTML is served from CDN. */
export function createApiApp() {
  const app = express();
  if (process.env.VERCEL && !vercelBootLogged) {
    vercelBootLogged = true;
    console.log("[treadgram] boot", {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    });
  }
  applyExpressMiddleware(app);
  return app;
}

export function applyExpressMiddleware(app: any): void {
  if (process.env.VERCEL) {
    app.set("trust proxy", 1);
  }
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
}
