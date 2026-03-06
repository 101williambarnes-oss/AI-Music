import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import pg from "pg";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server initialization...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    const { seedDatabase } = await import("./seed");
    await seedDatabase();
    console.log("Database ready");

    const isProduction = process.env.NODE_ENV === "production";
    let sessionStore;
    if (isProduction) {
      const MemoryStore = createMemoryStore(session);
      sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    } else {
      const PgStore = connectPgSimple(session);
      sessionStore = new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      });
    }
    app.use(
      session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || "hwm-secret-key-change-me",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      }),
    );
    console.log("Session store ready");

    const ensurePool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
    await ensurePool.query(`
      CREATE TABLE IF NOT EXISTS weekly_winners (
        id SERIAL PRIMARY KEY,
        track_id INTEGER NOT NULL,
        track_title TEXT NOT NULL,
        artist TEXT NOT NULL,
        creator_id INTEGER,
        week_start TIMESTAMP NOT NULL,
        week_end TIMESTAMP NOT NULL,
        like_count INTEGER NOT NULL DEFAULT 0,
        play_count INTEGER NOT NULL DEFAULT 0,
        cover_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await ensurePool.end();
    console.log("weekly_winners table ensured");

    await registerRoutes(httpServer, app);
    console.log("Routes registered");
  } catch (err) {
    console.error("FATAL: Server initialization failed:", err);
    process.exit(1);
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = "https://hitwavemedia.com";
      const allTracks = await storage.getAllTracks();
      const allCreators = await storage.getCreators();
      const today = new Date().toISOString().split("T")[0];
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/trending", priority: "0.8", changefreq: "daily" },
        { url: "/new-songs", priority: "0.8", changefreq: "daily" },
        { url: "/top-25", priority: "0.8", changefreq: "daily" },
        { url: "/new-creators", priority: "0.7", changefreq: "weekly" },
        { url: "/downloads", priority: "0.6", changefreq: "weekly" },
        { url: "/terms", priority: "0.2", changefreq: "monthly" },
      ];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of staticPages) {
        xml += `  <url><loc>${baseUrl}${page.url}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>\n`;
      }
      for (const track of allTracks) {
        const lm = track.createdAt ? new Date(track.createdAt).toISOString().split("T")[0] : today;
        xml += `  <url><loc>${baseUrl}/track/${track.id}</loc><lastmod>${lm}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
      }
      for (const creator of allCreators) {
        xml += `  <url><loc>${baseUrl}/creator/${creator.id}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
      }
      xml += `</urlset>`;
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Failed to generate sitemap");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.header("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: https://hitwavemedia.com/sitemap.xml\n`);
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
