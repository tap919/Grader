import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import passport from "passport";
import session from "express-session";

// Import Phase 1 Components
import { initDb } from "./src/server/db/pool.ts";
import { setupGitHubStrategy } from "./src/server/auth/github.ts";
import authRoutes from "./src/server/routes/auth.ts";
import scansRoutes from "./src/server/routes/scans.ts";
import orgsRoutes from "./src/server/routes/orgs.ts";
import { authMiddleware, orgAccessMiddleware } from "./src/server/middleware/auth.ts";
import { limitHeadersMiddleware } from "./src/server/middleware/tenant.ts";

dotenv.config();

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const requiredEnvVars = [
  "GEMINI_API_KEY",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "JWT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error("   Please check your .env file. See .env.example for the template.");
  process.exit(1);
}

// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
  })
);

// Session middleware (for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "grader-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Passport authentication
app.use(passport.initialize());
app.use(passport.session());
setupGitHubStrategy();

// Rate limiting for general API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

// ============================================================================
// HEALTH & STATUS ENDPOINTS
// ============================================================================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/status", (_req, res) => {
  res.json({
    service: "Grader SaaS API",
    version: "1.0.0",
    phase: "Phase 1 - SaaS Core",
    status: "operational",
  });
});

// ============================================================================
// PHASE 1 API ROUTES
// ============================================================================

// Authentication routes (OAuth, API keys, user info)
app.use("/api/v1/auth", authRoutes);

// Scans routes (submit, list, retrieve, delete)
app.use("/api/v1/scans", scansRoutes);

// Organizations routes (CRUD, members, usage)
app.use("/api/v1/orgs", orgsRoutes);

// ============================================================================
// VITE SPA INTEGRATION (FRONTEND)
// ============================================================================

let vite: any;

async function setupVite() {
  if (process.env.NODE_ENV === "production") {
    // Serve pre-built frontend
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    // Development: use Vite dev server
    try {
      vite = await createViteServer({
        server: { middlewareMode: true },
      });
      app.use(vite.middlewares);
      app.get("*", async (req, res) => {
        try {
          const url = req.originalUrl;
          let template = await vite.transformIndexHtml(
            url,
            require("fs").readFileSync(path.join(__dirname, "index.html"), "utf-8")
          );
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          res.status(500).end(e.message);
        }
      });
    } catch (error) {
      console.error("Failed to setup Vite:", error);
    }
  }
}

// ============================================================================
// LEGACY ENDPOINTS (FOR BACKWARDS COMPATIBILITY)
// ============================================================================

// Keep the old in-memory /api/grade endpoint for demo purposes
// but redirect new users to /api/v1/scans

app.post("/api/grade", authMiddleware, async (req, res) => {
  // This endpoint is deprecated - use POST /api/v1/scans instead
  res.status(410).json({
    error: "Endpoint deprecated",
    message: "Please use POST /api/v1/scans for new scans",
    documentation: "https://github.com/Billion-Business/Grader-main",
  });
});

app.get("/api/scans", authMiddleware, async (req, res) => {
  // Redirect to new endpoint
  res.redirect("/api/v1/scans");
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler (must be last)
app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "Endpoint not found. Check your request path.",
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    console.log("🚀 Grader SaaS - Phase 1 Startup");
    console.log("===============================");

    // Initialize database
    console.log("📦 Initializing database...");
    await initDb();
    console.log("✅ Database ready");

    // Setup Vite frontend
    console.log("🎨 Setting up frontend...");
    await setupVite();
    console.log("✅ Frontend ready");

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api/v1`);
      console.log(`🔐 OAuth: http://localhost:${PORT}/api/v1/auth/github`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`\nPhase 1 Features:`);
      console.log(`  ✓ GitHub OAuth login`);
      console.log(`  ✓ API key management`);
      console.log(`  ✓ Multi-tenant orgs`);
      console.log(`  ✓ Scan persistence (PostgreSQL/SQLite)`);
      console.log(`  ✓ Rate limiting & plan tiers`);
      console.log(`  ✓ Free tier (3 scans/month)`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

export default app;
