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
    const allowed = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (.mp3, .wav, .ogg, .flac, .m4a, .aac)"));
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

  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/tracks/upload", (req, res, next) => {
    upload.single("audioFile")(req, res, (err) => {
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
      });

      await storage.incrementCreatorTrackCount(creator.id);

      res.json({ track, creatorId: creator.id });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload track" });
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

  app.get("/api/tracks/:category", async (req, res) => {
    try {
      const { category } = req.params;
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

  app.get("/api/genres", async (_req, res) => {
    try {
      const genres = await storage.getGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  return httpServer;
}
