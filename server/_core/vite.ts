import express from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer, type InlineConfig } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: any, server: Server) {
  const baseConfig: InlineConfig =
    typeof viteConfig === "function"
      ? await viteConfig({
          command: "serve",
          mode: process.env.NODE_ENV === "production" ? "production" : "development",
          isSsrBuild: false,
          isPreview: false,
        })
      : viteConfig;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...baseConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: any, res: any, next: (err?: unknown) => void) => {
    const url = req.originalUrl;
    const pathname = req.path;

    // Let Vite serve module/asset/HMR requests; only HTML navigations should fall back to index.html.
    const isViteInternal = pathname.startsWith("/@vite") || pathname.startsWith("/@fs");
    const isSourceModule = pathname.startsWith("/src/") || pathname.startsWith("/node_modules/");
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (isViteInternal || isSourceModule || hasFileExtension) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: any) {
  const distPath = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first (vite outputs to ./public)`
    );
  }

  // On Vercel, files under ./public are served from the CDN; express.static is skipped there.
  if (!process.env.VERCEL) {
    app.use(express.static(distPath));
  }

  app.use("*", (_req: unknown, res: any) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
