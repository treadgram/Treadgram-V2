import type { Server } from "http";
import { serveStatic, setupVite } from "./vite";

export function attachBuiltClient(app: any): void {
  serveStatic(app);
}

export async function finishAppSetup(app: any, httpServer: Server | null): Promise<void> {
  if (process.env.NODE_ENV === "development" && httpServer) {
    await setupVite(app, httpServer);
  } else {
    attachBuiltClient(app);
  }
}
