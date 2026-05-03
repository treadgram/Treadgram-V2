import express, { type Express } from "express";
import type { Server } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { serveStatic, setupVite } from "./vite";

export function applyExpressMiddleware(app: Express): void {
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

/** Serves the Vite production build from `./public` (and SPA fallback). */
export function attachBuiltClient(app: Express): void {
  serveStatic(app);
}

export async function finishAppSetup(app: Express, httpServer: Server | null): Promise<void> {
  if (process.env.NODE_ENV === "development" && httpServer) {
    await setupVite(app, httpServer);
  } else {
    attachBuiltClient(app);
  }
}
