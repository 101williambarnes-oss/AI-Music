import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signupSchema, signinSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_EXTS = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".gif", ".webp"];

const ALLOWED_MIMES = [
  "audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/ogg", "audio/flac", "audio/x-flac",
  "audio/mp4", "audio/x-m4a", "audio/aac", "audio/x-aac",
  "video/mp4", "video/webm", "video/quicktime",
  "image/jpeg", "image/png", "image/gif", "image/webp",
];

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = ALLOWED_MIMES.includes(file.mimetype);
    const extOk = ALLOWED_EXTS.includes(ext);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only audio (MP3, WAV, OGG, FLAC, M4A, AAC), video (MP4, WEBM, MOV), and image (JPG, PNG, GIF, WEBP) files are allowed."));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { name, email, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ name, email, passwordHash });

      const colors = ["cyan", "purple", "pink"];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];
      const creator = await storage.insertCreator({
        name,
        trackCount: 0,
        avatarColor,
        userId: user.id,
      });

      await storage.updateUserCreatorId(user.id, creator.id);

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        res.json({ user: { id: user.id, name: user.name, email: user.email, creatorId: creator.id } });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const creator = await storage.getCreatorByUserId(user.id);

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        res.json({ user: { id: user.id, name: user.name, email: user.email, creatorId: creator?.id || null } });
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to sign out" });
      }
      res.json({ message: "Signed out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const creator = await storage.getCreatorByUserId(user.id);
      res.json({ user: { id: user.id, name: user.name, email: user.email, creatorId: creator?.id || null } });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.use("/uploads", (_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  }, express.static(uploadsDir));

  app.get("/api/tracks/:id/download", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });

      const track = await storage.getTrack(trackId);
      if (!track || !track.fileUrl) {
        return res.status(404).json({ message: "Track not found or has no file" });
      }

      const filePath = path.join(process.cwd(), track.fileUrl.replace(/^\//, ""));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      const safeName = track.title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "track";
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeName)}${path.extname(filePath)}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error("Download error:", err);
      if (!res.headersSent) res.status(500).json({ message: "Download failed" });
    }
  });

  app.post("/api/tracks/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File is too large. Maximum size is 50MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, async (req, res) => {
    const userId = req.session.userId || req.body.userId;
    if (!userId) {
      return res.status(401).json({ message: "You must be signed in to upload" });
    }
    try {
      const { title, genre, aiTools } = req.body;
      if (!title || !genre) {
        return res.status(400).json({ message: "Title and genre are required" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      let creator = await storage.getCreatorByUserId(user.id);
      if (!creator) {
        const colors = ["cyan", "purple", "pink"];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];
        creator = await storage.insertCreator({
          name: user.name,
          trackCount: 0,
          avatarColor,
          userId: user.id,
        });
        await storage.updateUserCreatorId(user.id, creator.id);
      }

      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const track = await storage.insertTrack({
        title,
        artist: creator.name,
        genre,
        plays: 0,
        rank: null,
        category: "new",
        creatorId: creator.id,
        fileUrl,
        coverUrl: null,
      });

      await storage.incrementCreatorTrackCount(creator.id);

      res.json({ track, creatorId: creator.id });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload track" });
    }
  });

  app.post("/api/creators/:id/avatar", (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File is too large. Maximum size is 50MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, async (req, res) => {
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "You must be signed in to update your avatar" });
    }
    try {
      const creatorId = parseInt(req.params.id);
      if (isNaN(creatorId)) return res.status(400).json({ message: "Invalid creator ID" });

      const creator = await storage.getCreatorByUserId(userId);
      if (!creator || creator.id !== creatorId) {
        return res.status(403).json({ message: "You can only update your own avatar" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        return res.status(400).json({ message: "Only image files are allowed for avatars" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      await storage.updateCreatorAvatar(creatorId, avatarUrl);

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  app.delete("/api/tracks/:id", async (req, res) => {
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    if (!userId) {
      return res.status(401).json({ message: "You must be signed in to delete tracks" });
    }
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) {
        return res.status(400).json({ message: "Invalid track ID" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const creator = await storage.getCreatorByUserId(user.id);
      if (!creator) {
        return res.status(403).json({ message: "You are not a creator" });
      }

      const creatorTracks = await storage.getTracksByCreatorId(creator.id);
      const track = creatorTracks.find(t => t.id === trackId);
      if (!track) {
        return res.status(403).json({ message: "You can only delete your own tracks" });
      }

      if (track.fileUrl) {
        const filePath = path.join(process.cwd(), track.fileUrl.replace(/^\//, ""));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await storage.deleteTrack(trackId);
      await storage.decrementCreatorTrackCount(creator.id);

      res.json({ message: "Track deleted" });
    } catch (error) {
      console.error("Delete track error:", error);
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  app.get("/api/tracks", async (_req, res) => {
    try {
      const allTracks = await storage.getAllTracks();
      res.json(allTracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const plays = await storage.incrementPlays(trackId);
      res.json({ plays });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment plays" });
    }
  });

  app.get("/api/tracks/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (category === "all") {
        const allTracks = await storage.getAllTracks();
        return res.json(allTracks);
      }
      if (category === "top25") {
        res.set("Cache-Control", "no-store");
        const topTracks = await storage.getTop25ByLikes();
        return res.json(topTracks);
      }
      if (category === "trending") {
        res.set("Cache-Control", "no-store");
        const trendingTracks = await storage.getTrendingTracks();
        return res.json(trendingTracks);
      }
      const tracks = await storage.getTracks(category);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.get("/api/creators", async (_req, res) => {
    try {
      const creators = await storage.getCreators();
      res.json(creators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });

  app.get("/api/creators/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid creator ID" });
      }
      const creator = await storage.getCreatorById(id);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }
      const tracks = await storage.getTracksByCreatorId(creator.id);
      const fallbackTracks = tracks.length > 0 ? tracks : await storage.getTracksByArtist(creator.name);
      res.json({ creator, tracks: fallbackTracks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creator" });
    }
  });

  app.get("/creator/:id", async (req, res, next) => {
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|pinterest|redditbot|embedly|quora|outbrain|vkshare|tumblr|skypeuripreview|nuzzel/i.test(ua);
    if (!isCrawler) return next();

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next();

      const creator = await storage.getCreatorById(id);
      if (!creator) return next();

      const tracks = await storage.getTracksByCreatorId(creator.id);
      const ogImage = creator.avatarUrl
        ? `${req.protocol}://${req.get("host")}${creator.avatarUrl}`
        : "";
      const ogTitle = `${creator.name} — Hit Wave Media`;
      const ogDesc = `Check out ${creator.name} on Hit Wave Media. ${creator.trackCount} track${creator.trackCount !== 1 ? "s" : ""} published. The Home of AI Music.`;
      const ogUrl = `${req.protocol}://${req.get("host")}/creator/${id}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDesc}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="Hit Wave Media" />
  ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}" />` : ""}
</head>
<body>
  <h1>${creator.name}</h1>
  <p>${ogDesc}</p>
  ${tracks.map(t => `<p>${t.title} by ${t.artist}</p>`).join("\n  ")}
</body>
</html>`;

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      next();
    }
  });

  app.get("/api/genres", async (_req, res) => {
    try {
      const genres = await storage.getGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  app.get("/api/tracks/:id/likes", async (req, res) => {
    try {
      res.set("Cache-Control", "no-store");
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const count = await storage.getLikeCount(trackId);
      const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
      const visitorId = req.headers["x-visitor-id"] as string;
      let liked = false;
      if (userId && !isNaN(userId)) {
        const existing = await storage.getUserLike(trackId, userId);
        liked = !!existing;
      } else if (visitorId) {
        const existing = await storage.getVisitorLike(trackId, visitorId);
        liked = !!existing;
      }
      res.json({ count, liked });
    } catch (error) {
      res.status(500).json({ message: "Failed to get likes" });
    }
  });

  app.post("/api/tracks/:id/likes", async (req, res) => {
    const visitorId = req.headers["x-visitor-id"] as string;
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    const effectiveId = (userId && !isNaN(userId)) ? userId : null;
    const effectiveVisitor = visitorId || null;
    if (!effectiveId && !effectiveVisitor) {
      return res.status(400).json({ message: "An identifier is required to like tracks" });
    }
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      if (effectiveId) {
        if (effectiveVisitor) {
          const existingVisitor = await storage.getVisitorLike(trackId, effectiveVisitor);
          if (existingVisitor) {
            await storage.removeVisitorLike(trackId, effectiveVisitor);
          }
        }
        const existing = await storage.getUserLike(trackId, effectiveId);
        if (existing) {
          await storage.removeLike(trackId, effectiveId);
        } else {
          await storage.addLike({ trackId, userId: effectiveId });
        }
        const count = await storage.getLikeCount(trackId);
        res.json({ count, liked: !existing });
      } else {
        const existing = await storage.getVisitorLike(trackId, effectiveVisitor!);
        if (existing) {
          await storage.removeVisitorLike(trackId, effectiveVisitor!);
        } else {
          await storage.addVisitorLike({ trackId, visitorId: effectiveVisitor! });
        }
        const count = await storage.getLikeCount(trackId);
        res.json({ count, liked: !existing });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/tracks/:id/comments/count", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const count = await storage.getCommentCount(trackId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get comment count" });
    }
  });

  app.get("/api/tracks/:id/comments", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const trackComments = await storage.getComments(trackId);
      res.json(trackComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/tracks/:id/comments", async (req, res) => {
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    const hasUser = userId && !isNaN(userId);
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const { text, visitorName } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Comment text is required" });
      }
      let commentUserName = "Visitor";
      let commentUserId = 0;
      if (hasUser) {
        const user = await storage.getUserById(userId);
        if (user) {
          commentUserName = user.name;
          commentUserId = user.id;
        }
      } else if (visitorName && typeof visitorName === "string" && visitorName.trim().length > 0) {
        commentUserName = visitorName.trim();
      }
      const comment = await storage.addComment({
        trackId,
        userId: commentUserId,
        userName: commentUserName,
        text: text.trim(),
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "You must be signed in to delete comments" });
    }
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) return res.status(400).json({ message: "Invalid comment ID" });
      await storage.deleteComment(commentId);
      res.json({ message: "Comment deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  return httpServer;
}
