import "dotenv/config";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { kiwifyRouter } from "../routers/kiwifyWebhook";

// ===== Rate Limiter (in-memory, sem dependência externa) =====
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(windowMs: number, maxRequests: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(ip);
    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }
    return next();
  };
}
// Limpa store a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, 5 * 60 * 1000);

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ===== Security Headers =====
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  // ===== Body parser (limite reduzido para segurança) =====
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));

  // ===== Health check =====
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ===== Rate limiting nos endpoints sensíveis =====
  app.use("/api/trpc/customers.verificarAcesso", rateLimit(60_000, 10)); // 10 req/min por IP
  app.use("/api/kiwify", rateLimit(60_000, 30)); // 30 req/min por IP

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Redirect pós-compra Kiwify (login.html → /plataforma)
  app.get("/login.html", (_req, res) => res.redirect(301, "/plataforma"));
  // Kiwify webhook
  app.use("/api/kiwify", kiwifyRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const distPath = path.resolve(import.meta.dirname, "public");
    const salesPath = path.resolve(import.meta.dirname, "sales");
    if (!fs.existsSync(distPath)) {
      console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }

    // Página de vendas estática na raiz (index.html, styles.css, script.js, etc.)
    if (fs.existsSync(salesPath)) {
      app.get("/", (_req, res) => res.sendFile(path.resolve(salesPath, "index.html")));
      app.use(express.static(salesPath));
    }

    // App React (plataforma, admin, etc.)
    app.use(express.static(distPath));

    // SPA fallback — rotas do React (/plataforma, /admin, etc.)
    app.use("*", (req, res) => {
      const url = (req as any).originalUrl || req.url || "";
      // Se for uma rota do app React, serve o index.html do React
      if (url.startsWith("/plataforma") || url.startsWith("/admin") || url.startsWith("/404")) {
        res.sendFile(path.resolve(distPath, "index.html"));
      } else {
        // Qualquer outra rota desconhecida → página de vendas
        res.sendFile(path.resolve(salesPath || distPath, "index.html"));
      }
    });
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
