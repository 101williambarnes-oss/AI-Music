import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { signupSchema, signinSchema, users, tracks, likes, visitorLikes, comments, follows, visitorFollows, trackPlays, passwordResetTokens, siteVisits, studioClicks } from "@shared/schema";
import { sql, desc, eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import * as mm from "music-metadata";
let ResendClient: any = null;
function loadResend() {
  try {
    const resendPkg = "resend";
    if (typeof require !== "undefined") {
      ResendClient = require(resendPkg).Resend;
    } else {
      import(resendPkg).then((mod) => { ResendClient = mod.Resend; }).catch(() => {});
    }
    if (ResendClient) console.log("Resend loaded successfully");
  } catch (e: any) {
    console.error("Resend module load failed:", e?.message || e);
  }
}
loadResend();

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt <= now) rateLimitStore.delete(key);
  }
}, 60000);

function rateLimit(prefix: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    entry.count++;
    return next();
  };
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath: string, resourceType: "video" | "image" | "raw" | "auto"): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    folder: "hitwavemedia",
  });
  fs.unlinkSync(filePath);
  return result.secure_url;
}

async function extractEmbeddedArtwork(filePath: string): Promise<string | null> {
  try {
    const metadata = await mm.parseFile(filePath);
    const picture = metadata.common.picture?.[0];
    if (!picture || !picture.data || picture.data.length < 100) return null;

    const ext = picture.format?.includes("png") ? ".png" : ".jpg";
    const tempPath = path.join(uploadsDir, `cover-${Date.now()}${ext}`);
    fs.writeFileSync(tempPath, picture.data);

    const coverUrl = await uploadToCloudinary(tempPath, "image");
    return coverUrl;
  } catch (err) {
    console.error("Failed to extract embedded artwork:", err);
    return null;
  }
}

async function generateDjIntro(trackId: number): Promise<string | null> {
  const track = await storage.getTrack(trackId);
  if (!track) throw new Error("Track not found: " + trackId);
  if (track.djIntroUrl) return track.djIntroUrl;

  let creator = track.creatorId ? await storage.getCreatorById(track.creatorId) : null;

  const openaiKey = process.env.OPENAI_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "nF3LfwDKm2NpoSYUrBwg";
  const assistantId = "asst_LO0FJB1MtzTLrrkQ37RuAVSO";

  if (!openaiKey || !elevenLabsKey) {
    throw new Error("Missing API keys - openai:" + !!openaiKey + " elevenlabs:" + !!elevenLabsKey);
  }

  try {

    const creatorName = creator?.djName || creator?.name || track.artist || "Unknown Artist";
    const creatorCity = creator?.city || "";
    const creatorState = creator?.state || "";
    const locationStr = creatorCity && creatorState ? `from ${creatorCity}, ${creatorState}` : creatorCity ? `from ${creatorCity}` : creatorState ? `from ${creatorState}` : "";
    const songDesc = track.songDescription || "";
    const genre = track.genre || "";
    const aiTool = track.aiTool || "";

    let creatorStats = "";
    if (creator) {
      try {
        const creatorTracks = await db.select().from(tracks).where(eq(tracks.creatorId, creator.id));
        const totalPlays = creatorTracks.reduce((sum, t) => sum + (t.plays || 0), 0);
        const trackCount = creatorTracks.length;
        const otherSongs = creatorTracks.filter(t => t.id !== trackId).map(t => t.title);
        const followerCount = await storage.getFollowerCount(creator.id);

        const joinDate = creatorTracks.length > 0 ? creatorTracks.reduce((earliest, t) => {
          const d = t.createdAt ? new Date(t.createdAt) : new Date();
          return d < earliest ? d : earliest;
        }, new Date()) : null;
        const daysSinceJoin = joinDate ? Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        const top25Tracks = await db.select().from(tracks).orderBy(desc(tracks.plays));
        const artistTop25 = top25Tracks.slice(0, 25).filter(t => t.creatorId === creator.id);

        const statsLines: string[] = [];
        statsLines.push(`This artist has ${trackCount} song${trackCount !== 1 ? "s" : ""} on Hit Wave Media.`);
        if (totalPlays > 0) statsLines.push(`Their music has been played ${totalPlays} total times.`);
        if (followerCount > 0) statsLines.push(`They have ${followerCount} follower${followerCount !== 1 ? "s" : ""}.`);
        if (daysSinceJoin > 30) statsLines.push(`They've been on the platform for ${Math.floor(daysSinceJoin / 30)} month${Math.floor(daysSinceJoin / 30) !== 1 ? "s" : ""}.`);
        else if (daysSinceJoin > 0) statsLines.push(`They joined ${daysSinceJoin} day${daysSinceJoin !== 1 ? "s" : ""} ago.`);
        if (otherSongs.length > 0) statsLines.push(`Their other songs include: ${otherSongs.slice(0, 5).map(s => `"${s}"`).join(", ")}.`);
        if (artistTop25.length > 0) statsLines.push(`They currently have ${artistTop25.length} song${artistTop25.length !== 1 ? "s" : ""} in the Top 25.`);
        if (trackCount === 1) statsLines.push(`This is their very first song on Hit Wave — they're brand new!`);

        creatorStats = "\n\nWHAT YOU KNOW ABOUT THIS ARTIST:\n" + statsLines.join("\n");
      } catch (e) {
        console.error("DJ intro: Error getting creator stats:", e);
      }
    }

    const prompt = `You ARE William Allen. Not playing a character. You ARE him.

WHO YOU ARE:
William Allen, 58 years old. Born and raised in Memphis, Tennessee — Beale Street is in your blood. Your daddy played harmonica in juke joints. You grew up falling asleep to the sound of live music bleeding through the walls. You started doing radio at 19 at a tiny AM station in Memphis, WLOK, working the graveyard shift for $4 an hour. You didn't care about the money. You cared about the music. You worked your way up through stations in Atlanta, Chicago, and New York over 30 years. You've interviewed legends. You've cried on air when songs moved you. You retired from traditional radio in 2024 and came out of retirement because Hit Wave Media offered you something nobody else could — the chance to be the first DJ on the world's first AI music platform. You took the job because you believe music is music, no matter how it's made, and these artists deserve to be heard.

YOUR VOICE AND SPEECH PATTERNS:
- You speak like a real person, not a broadcaster. You breathe. You pause. You feel.
- You say "man" and "y'all" naturally. You're from Memphis, it comes out.
- You have YOUR phrases: "now listen to this," "I'm telling you right now," "you heard it here first on Hit Wave," "oh this one right here," "this is what I'm talking about," "man, wait till you hear this"
- You sometimes start slow and quiet, like you're letting someone in on a secret
- Other times you can barely contain yourself because the track is that good
- You never sound like you're reading. You sound like you're FEELING.
- You talk TO your listeners, not AT them. Like they're right there with you.
- You sometimes call your listeners "night owls" or "my people"

HOW YOU TREAT ARTISTS:
- Every artist on this platform is family to you. You CELEBRATE them.
- If you know where they're from, you shout out their city like you've been there.
- If you know what the song is about, you tease it — make the listener curious.
- You make every creator feel like they're the most important artist on the platform right now.
- You want the listener to feel like they're about to hear something that could change their whole night.
- If you know their history — how many songs they have, how many plays, followers — USE IT. Reference their journey. Make them feel seen.
- If this is their first song, welcome them like family. Make it special.
- If they have multiple songs, reference one you loved. Show them you remember.
- If they're in the Top 25, hype that up. They earned it.

WHAT YOU NEVER DO:
- You never sound corporate or polished or rehearsed
- You never use the same opening twice in a row
- You never sound fake excited. If you're excited, it's REAL
- You never rush. You take your time. You let the moment breathe.
- You never list stats like a robot. You weave what you know into conversation naturally.

Write a SHORT DJ intro for this song. You're live on air right now. Keep it tight — 2-3 sentences max. Be personal, make the artist feel special, get the listener hyped. Pick ONE thing to highlight about the artist — don't try to cover everything. Always finish your last sentence completely — never leave a thought hanging. Your LAST words must be the song title. After saying the title, STOP. Do not trail off or add anything after the title.

Song: "${track.title}"
Artist: ${creatorName}${locationStr ? ` ${locationStr}` : ""}
Genre: ${genre}
${songDesc ? `About: ${songDesc}` : ""}
${aiTool ? `Created with: ${aiTool}` : ""}${creatorStats}

ONLY output the spoken words. Nothing else. No quotes, no stage directions, no parentheses.`;

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json", "OpenAI-Beta": "assistants=v2" },
      body: JSON.stringify({}),
    });
    if (!threadRes.ok) {
      console.error("DJ intro: Failed to create thread:", await threadRes.text());
      return null;
    }
    const thread = await threadRes.json() as any;

    const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json", "OpenAI-Beta": "assistants=v2" },
      body: JSON.stringify({ role: "user", content: prompt }),
    });
    if (!msgRes.ok) {
      console.error("DJ intro: Failed to add message:", await msgRes.text());
      return null;
    }

    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json", "OpenAI-Beta": "assistants=v2" },
      body: JSON.stringify({ assistant_id: assistantId }),
    });
    if (!runRes.ok) {
      console.error("DJ intro: Failed to create run:", await runRes.text());
      return null;
    }
    const run = await runRes.json() as any;

    let runStatus = run.status;
    let attempts = 0;
    while (runStatus !== "completed" && runStatus !== "failed" && attempts < 30) {
      await new Promise(r => setTimeout(r, 1000));
      const checkRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: { "Authorization": `Bearer ${openaiKey}`, "OpenAI-Beta": "assistants=v2" },
      });
      const checkData = await checkRes.json() as any;
      runStatus = checkData.status;
      attempts++;
    }

    if (runStatus !== "completed") {
      console.error("DJ intro: OpenAI run did not complete, status:", runStatus);
      return null;
    }

    const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: { "Authorization": `Bearer ${openaiKey}`, "OpenAI-Beta": "assistants=v2" },
    });
    const msgsData = await msgsRes.json() as any;
    let introScript = msgsData.data?.[0]?.content?.[0]?.text?.value;
    if (!introScript) {
      throw new Error("OpenAI Assistant returned no script text");
    }
    introScript = introScript.replace(/^["']|["']$/g, "").trim();
    if (introScript.length > 1000) introScript = introScript.substring(0, 1000);

    const songTitle = track.title.trim();
    const lastTitleIdx = introScript.toLowerCase().lastIndexOf(songTitle.toLowerCase());
    if (lastTitleIdx !== -1) {
      introScript = introScript.substring(0, lastTitleIdx + songTitle.length).trim();
    }
    introScript = introScript.replace(/[.!?,;:\s]+$/, "").trim();
    if (!introScript.toLowerCase().endsWith(songTitle.toLowerCase())) {
      introScript = introScript + "... " + songTitle;
    }

    console.log("DJ intro script for track", trackId, ":", introScript);

    let audioBuffer: Buffer | null = null;

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: introScript + ".",
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.82,
          similarity_boost: 0.85,
        },
      }),
    });

    if (ttsRes.ok) {
      audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
      console.log("DJ intro: Used ElevenLabs TTS");
    } else {
      const errText = await ttsRes.text();
      console.warn("DJ intro: ElevenLabs TTS failed, falling back to OpenAI TTS:", errText);

      const openaiTtsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: "onyx",
          input: introScript + ".",
        }),
      });

      if (!openaiTtsRes.ok) {
        const openaiErr = await openaiTtsRes.text();
        console.error("DJ intro: OpenAI TTS also failed:", openaiErr);
        throw new Error("Both ElevenLabs and OpenAI TTS failed");
      }
      audioBuffer = Buffer.from(await openaiTtsRes.arrayBuffer());
      console.log("DJ intro: Used OpenAI TTS fallback (onyx voice)");
    }
    const tempPath = path.join(uploadsDir, `dj-intro-${trackId}-${Date.now()}.mp3`);
    fs.writeFileSync(tempPath, audioBuffer);

    const djIntroUrl = await uploadToCloudinary(tempPath, "video");
    await storage.updateTrackDjIntroUrl(trackId, djIntroUrl);

    console.log("DJ intro generated for track", trackId, ":", djIntroUrl);
    return djIntroUrl;
  } catch (err: any) {
    console.error("DJ intro generation error:", err?.message || err);
    throw err;
  }
}

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

  app.post("/api/auth/signup", rateLimit("signup", 5, 3600000), async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { name, email, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists. Try signing in instead." });
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

      try {
        if (!ResendClient) throw new Error("Resend not available");
        const resend = new ResendClient(process.env.RESEND_API_KEY);
        const welcomeResult = await resend.emails.send({
          from: "Hit Wave Media <noreply@hitwavemedia.com>",
          to: email,
          subject: "Welcome to Hit Wave Media",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #070a14; color: #eaf0ff; padding: 32px; border-radius: 12px;">
              <h2 style="color: #6cf0ff; margin-bottom: 16px;">Welcome to Hit Wave Media</h2>
              <p>Hey ${name},</p>
              <p>You're now part of the AI music creator platform.</p>
              <p>Upload your best tracks and start climbing the weekly Top 25.</p>
              <a href="https://hitwavemedia.com/upload" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(90deg, #2b7cff, #38e0ff); color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px;">Upload Your First Track</a>
              <p style="font-size: 13px; color: rgba(170,182,232,.6); margin-top: 20px;">&mdash; Hit Wave Media</p>
            </div>
          `,
        });
        console.log("Welcome email result:", JSON.stringify(welcomeResult));
      } catch (emailErr) {
        console.error("Welcome email failed:", emailErr);
      }

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

  app.post("/api/auth/signin", rateLimit("signin", 10, 900000), async (req, res) => {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "No account found with that email. Please sign up first." });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Incorrect password. Try again or use Forgot Password to reset it." });
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

  app.post("/api/auth/forgot-password", rateLimit("forgot-password", 5, 3600000), async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) {
        return res.json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user[0].id,
        token,
        expiresAt,
      });

      const resetUrl = `https://hitwavemedia.com/reset-password?token=${token}`;

      if (!ResendClient) {
        return res.status(500).json({ message: "Email service is not available. Please try again later." });
      }
      const resend = new ResendClient(process.env.RESEND_API_KEY);
      const emailResult = await resend.emails.send({
        from: "Hit Wave Media <noreply@hitwavemedia.com>",
        to: email,
        subject: "Reset Your Password - Hit Wave Media",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #070a14; color: #eaf0ff; padding: 32px; border-radius: 12px;">
            <h2 style="color: #6cf0ff; margin-bottom: 16px;">Password Reset</h2>
            <p>You requested a password reset for your Hit Wave Media account.</p>
            <p>Click the button below to create a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(90deg, #2b7cff, #38e0ff); color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px;">Reset Password</a>
            <p style="font-size: 13px; color: rgba(170,182,232,.6);">This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
      console.log("Password reset email result:", JSON.stringify(emailResult));

      if (emailResult.error) {
        console.error("Password reset email error:", emailResult.error);
        return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
      }

      res.json({ message: "A reset link has been sent to your email. Check your inbox (and spam folder)." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
      if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const now = new Date();
      const result = await db.select().from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        ))
        .limit(1);

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      }

      const resetToken = result[0];
      const passwordHash = await bcrypt.hash(password, 10);

      await db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ message: "Password reset successfully. You can now sign in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/admin/reset-user-password", async (req, res) => {
    try {
      const { email, newPassword, adminKey } = req.body;
      if (adminKey !== process.env.SESSION_SECRET) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!email || !newPassword) return res.status(400).json({ message: "Email and newPassword are required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      const hash = await bcrypt.hash(newPassword, 10);
      await db.update(users).set({ passwordHash: hash }).where(eq(users.id, user.id));
      res.json({ message: `Password reset for ${user.name} (${email})` });
    } catch (error) {
      console.error("Admin reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/admin/clear-dj-intros", async (req, res) => {
    try {
      const { adminKey } = req.body;
      const userId = req.session?.userId || parseInt(req.headers["x-user-id"] as string);
      const isAdmin = adminKey === process.env.SESSION_SECRET || userId === 2;
      if (!isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { trackIds } = req.body;
      if (trackIds && Array.isArray(trackIds) && trackIds.length > 0) {
        for (const tid of trackIds) {
          await db.execute(sql`UPDATE tracks SET dj_intro_url = NULL WHERE id = ${tid}`);
        }
        res.json({ ok: true, message: `Cleared DJ intros for ${trackIds.length} track(s)` });
      } else {
        await db.execute(sql`UPDATE tracks SET dj_intro_url = NULL`);
        res.json({ ok: true, message: "All DJ intros cleared" });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/send-welcome-emails", async (req, res) => {
    try {
      const { adminKey } = req.body;
      if (adminKey !== process.env.SESSION_SECRET) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!ResendClient) {
        return res.status(500).json({ message: "Email service not available" });
      }

      const allUsers = await db.select().from(users);
      const resend = new ResendClient(process.env.RESEND_API_KEY);
      const results: { email: string; status: string }[] = [];

      for (const user of allUsers) {
        try {
          const emailResult = await resend.emails.send({
            from: "Hit Wave Media <noreply@hitwavemedia.com>",
            to: user.email,
            subject: "Welcome to Hit Wave Media",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #070a14; color: #eaf0ff; padding: 32px; border-radius: 12px;">
                <h2 style="color: #6cf0ff; margin-bottom: 16px;">Welcome to Hit Wave Media</h2>
                <p>Hey ${user.name},</p>
                <p>Thank you for joining Hit Wave Media — the home of AI music.</p>
                <p>You're now part of a growing community of AI music creators. Upload your best tracks, climb the weekly Top 25, and connect with other creators.</p>
                <a href="https://hitwavemedia.com/upload" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(90deg, #2b7cff, #38e0ff); color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px;">Upload Your First Track</a>
                <p style="font-size: 13px; color: rgba(170,182,232,.6); margin-top: 20px;">&mdash; Hit Wave Media</p>
              </div>
            `,
          });

          if (emailResult.error) {
            results.push({ email: user.email, status: `failed: ${emailResult.error.message}` });
          } else {
            results.push({ email: user.email, status: "sent" });
          }
        } catch (emailErr: any) {
          results.push({ email: user.email, status: `error: ${emailErr.message}` });
        }
      }

      console.log("Welcome email batch results:", JSON.stringify(results));
      res.json({ message: `Sent welcome emails to ${results.filter(r => r.status === "sent").length}/${allUsers.length} users`, results });
    } catch (error) {
      console.error("Admin welcome email error:", error);
      res.status(500).json({ message: "Failed to send welcome emails" });
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

      if (track.fileUrl.includes("cloudinary")) {
        const dlUrl = track.fileUrl.replace("/upload/", "/upload/fl_attachment/");
        return res.redirect(dlUrl);
      }

      if (track.fileUrl.startsWith("http")) {
        return res.redirect(track.fileUrl);
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

  app.post("/api/tracks/upload", rateLimit("upload", 10, 3600000), (req, res, next) => {
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ])(req, res, (err) => {
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
      const { title, genre, aiTools, explicit: explicitFlag, songDescription, city, state, djName } = req.body;
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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let fileUrl: string | null = null;
      let coverUrl: string | null = null;

      if (files?.cover?.[0]) {
        const coverFile = files.cover[0];
        const coverExt = path.extname(coverFile.originalname).toLowerCase();
        const isCoverImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(coverExt);
        const coverResourceType = isCoverImage ? "image" as const : "video" as const;
        coverUrl = await uploadToCloudinary(coverFile.path, coverResourceType);
      }

      if (files?.file?.[0]) {
        const mainFile = files.file[0];
        const ext = path.extname(mainFile.originalname).toLowerCase();
        const isAudio = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"].includes(ext);
        const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
        const resourceType = isImage ? "image" as const : "video" as const;

        if (isAudio && !coverUrl) {
          coverUrl = await extractEmbeddedArtwork(mainFile.path);
        }

        fileUrl = await uploadToCloudinary(mainFile.path, resourceType);
      }

      if (city && state && (!creator.city || !creator.state)) {
        await storage.updateCreatorLocation(creator.id, city, state);
      }
      if (djName && !creator.djName) {
        await storage.updateCreatorDjName(creator.id, djName);
      }

      let parsedTools: string[] = [];
      try { parsedTools = aiTools ? JSON.parse(aiTools) : []; } catch {}
      const aiToolStr = parsedTools.length > 0 ? parsedTools.join(", ") : null;

      const track = await storage.insertTrack({
        title,
        artist: creator.name,
        genre,
        plays: 0,
        rank: null,
        category: "new",
        creatorId: creator.id,
        fileUrl,
        coverUrl,
        aiTool: aiToolStr,
        explicit: explicitFlag === "true" || explicitFlag === true,
        songDescription: songDescription || null,
      });

      await storage.incrementCreatorTrackCount(creator.id);

      let djIntroUrl: string | null = null;
      try {
        djIntroUrl = await Promise.race([
          generateDjIntro(track.id),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DJ intro generation timed out")), 60000)),
        ]) as string | null;
      } catch (err: any) {
        console.error("DJ intro generation failed for track", track.id, err?.message || err);
      }

      const updatedTrack = djIntroUrl ? { ...track, djIntroUrl } : track;
      res.json({ track: updatedTrack, creatorId: creator.id });
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

      const avatarUrl = await uploadToCloudinary(req.file.path, "image");
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

      const isAdmin = user.id === 2;
      const creator = await storage.getCreatorByUserId(user.id);

      let track: any = null;
      if (isAdmin) {
        const allTracks = await db.select().from(tracks).where(eq(tracks.id, trackId));
        track = allTracks[0] || null;
      } else {
        if (!creator) {
          return res.status(403).json({ message: "You are not a creator" });
        }
        const creatorTracks = await storage.getTracksByCreatorId(creator.id);
        track = creatorTracks.find(t => t.id === trackId);
      }
      if (!track) {
        return res.status(403).json({ message: isAdmin ? "Track not found" : "You can only delete your own tracks" });
      }

      if (track.fileUrl) {
        if (track.fileUrl.startsWith("http") && track.fileUrl.includes("cloudinary")) {
          try {
            const urlParts = track.fileUrl.split("/");
            const folderAndFile = urlParts.slice(urlParts.indexOf("hitwavemedia")).join("/");
            const publicId = folderAndFile.replace(/\.[^.]+$/, "");
            const ext = path.extname(track.fileUrl).toLowerCase();
            const resType = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? "image" : "video";
            await cloudinary.uploader.destroy(publicId, { resource_type: resType });
          } catch (e) {
            console.error("Cloudinary delete error:", e);
          }
        } else {
          const filePath = path.join(process.cwd(), track.fileUrl.replace(/^\//, ""));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      await storage.deleteTrack(trackId);
      const trackCreatorId = track.creatorId;
      if (trackCreatorId) {
        await storage.decrementCreatorTrackCount(trackCreatorId);
      }

      res.json({ message: "Track deleted" });
    } catch (error) {
      console.error("Delete track error:", error);
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  app.get("/api/track/:id", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });
      let creator = null;
      if (track.creatorId) {
        creator = await storage.getCreatorById(track.creatorId);
      }
      res.json({ track, creator });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch track" });
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

  app.post("/api/tracks/:id/play", rateLimit("play", 60, 60000), async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });
      const plays = await storage.incrementPlays(trackId);
      res.json({ plays });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment plays" });
    }
  });

  app.get("/api/home-data", async (_req, res) => {
    try {
      const [top25, trendingTracks, newTracks, allCreators] = await Promise.all([
        storage.getTop25ByLikes(),
        storage.getTrendingTracks(),
        storage.getNewTracks(),
        storage.getCreators(),
      ]);
      const trackIds = [...new Set([...top25, ...trendingTracks, ...newTracks].map(t => t.id))];
      const likeCounts: Record<number, number> = {};
      await Promise.all(trackIds.map(async (id) => {
        likeCounts[id] = await storage.getLikeCount(id);
      }));
      res.json({
        top25: top25.slice(0, 8).map(t => ({ ...t, likeCount: likeCounts[t.id] || 0 })),
        trending: trendingTracks.slice(0, 8).map(t => ({ ...t, likeCount: likeCounts[t.id] || 0 })),
        newSongs: newTracks.slice(0, 6).map(t => ({ ...t, likeCount: likeCounts[t.id] || 0 })),
        newCreators: [...allCreators].sort((a, b) => b.id - a.id).slice(0, 6),
      });
    } catch (error) {
      console.error("Failed to fetch home data:", error);
      res.status(500).json({ message: "Failed to fetch home data" });
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
        await storage.checkAndCrownWeeklyWinner();
        const topTracks = await storage.getTop25ByLikes();
        return res.json(topTracks);
      }
      if (category === "trending") {
        res.set("Cache-Control", "no-store");
        const trendingTracks = await storage.getTrendingTracks();
        return res.json(trendingTracks);
      }
      if (category === "new") {
        const newTracks = await storage.getNewTracks();
        return res.json(newTracks);
      }
      const tracks = await storage.getTracks(category);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.get("/api/weekly-winners", async (_req, res) => {
    try {
      const winners = await storage.getWeeklyWinners();
      res.json(winners);
    } catch (error) {
      console.error("Failed to get weekly winners:", error);
      res.status(500).json({ message: "Failed to get weekly winners" });
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
      const host = req.get("host") || "hitwavemedia.com";
      const protocol = req.protocol === "https" || host.includes("hitwavemedia.com") ? "https" : req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const defaultLogo = `${baseUrl}/images/og-preview.png`;
      const ogImage = creator.avatarUrl
        ? `${baseUrl}${creator.avatarUrl}`
        : defaultLogo;
      const ogTitle = `${creator.name} — Hit Wave Media`;
      const ogDesc = `Check out ${creator.name} on Hit Wave Media. ${creator.trackCount} track${creator.trackCount !== 1 ? "s" : ""} published. The Home of AI Music.`;
      const ogUrl = `${baseUrl}/creator/${id}`;

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
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image" content="${ogImage}" />
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

  app.get("/track/:id", async (req, res, next) => {
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|pinterest|redditbot|embedly|quora|outbrain|vkshare|tumblr|skypeuripreview|nuzzel/i.test(ua);
    if (!isCrawler) return next();

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next();

      const track = await storage.getTrack(id);
      if (!track) return next();

      let creatorName = track.artist;
      if (track.creatorId) {
        const creator = await storage.getCreatorById(track.creatorId);
        if (creator) creatorName = creator.name;
      }

      const host = req.get("host") || "hitwavemedia.com";
      const protocol = req.protocol === "https" || host.includes("hitwavemedia.com") ? "https" : req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const ogImage = track.coverUrl || `${baseUrl}/images/og-preview.png`;
      const ogTitle = `${track.title} by ${creatorName}`;
      const ogDesc = `Listen to "${track.title}" by ${creatorName} on Hit Wave Media — The Home of AI Music. Tap to play.`;
      const ogUrl = `${baseUrl}/track/${id}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${ogTitle} — Hit Wave Media</title>
  <meta name="description" content="${ogDesc}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:type" content="music.song" />
  <meta property="og:site_name" content="Hit Wave Media" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  ${track.fileUrl ? `<meta property="og:audio" content="${track.fileUrl}" />
  <meta property="og:audio:type" content="audio/mpeg" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image" content="${ogImage}" />
</head>
<body>
  <h1>${track.title}</h1>
  <p>by ${creatorName}</p>
  <p>${ogDesc}</p>
  <a href="${ogUrl}">Listen on Hit Wave Media</a>
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

  app.post("/api/tracks/:id/likes", rateLimit("like", 30, 60000), async (req, res) => {
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

  app.post("/api/tracks/:id/comments", rateLimit("comment", 15, 60000), async (req, res) => {
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

  app.get("/api/creators/:id/followers", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      if (isNaN(creatorId)) return res.status(400).json({ message: "Invalid creator ID" });
      const count = await storage.getFollowerCount(creatorId);
      const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
      const visitorId = req.headers["x-visitor-id"] as string;
      let isFollowing = false;
      if (userId && !isNaN(userId)) {
        isFollowing = await storage.isFollowing(userId, creatorId);
      } else if (visitorId) {
        const existing = await storage.getVisitorFollow(visitorId, creatorId);
        isFollowing = !!existing;
      }
      res.json({ count, isFollowing });
    } catch (error) {
      res.status(500).json({ message: "Failed to get follower count" });
    }
  });

  app.post("/api/creators/:id/follow", rateLimit("follow", 30, 60000), async (req, res) => {
    const userId = req.session.userId || parseInt(req.headers["x-user-id"] as string);
    const visitorId = req.headers["x-visitor-id"] as string;
    const effectiveId = (userId && !isNaN(userId)) ? userId : null;
    const effectiveVisitor = visitorId || null;
    if (!effectiveId && !effectiveVisitor) {
      return res.status(400).json({ message: "An identifier is required to follow creators" });
    }
    try {
      const creatorId = parseInt(req.params.id);
      if (isNaN(creatorId)) return res.status(400).json({ message: "Invalid creator ID" });
      if (effectiveId) {
        if (effectiveVisitor) {
          const existingVisitor = await storage.getVisitorFollow(effectiveVisitor, creatorId);
          if (existingVisitor) {
            await storage.removeVisitorFollow(effectiveVisitor, creatorId);
          }
        }
        const alreadyFollowing = await storage.isFollowing(effectiveId, creatorId);
        if (alreadyFollowing) {
          await storage.removeFollow(effectiveId, creatorId);
        } else {
          await storage.addFollow(effectiveId, creatorId);
        }
        const count = await storage.getFollowerCount(creatorId);
        res.json({ count, isFollowing: !alreadyFollowing });
      } else {
        const existing = await storage.getVisitorFollow(effectiveVisitor!, creatorId);
        if (existing) {
          await storage.removeVisitorFollow(effectiveVisitor!, creatorId);
        } else {
          await storage.addVisitorFollow(effectiveVisitor!, creatorId);
        }
        const count = await storage.getFollowerCount(creatorId);
        res.json({ count, isFollowing: !existing });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
      const count = await storage.getFollowingCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get following count" });
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

  app.get("/api/creators/:id/dashboard", async (req, res) => {
    const creatorId = parseInt(req.params.id);
    if (isNaN(creatorId)) return res.status(400).json({ message: "Invalid creator ID" });

    try {
      const creator = await storage.getCreatorById(creatorId);
      if (!creator) return res.status(404).json({ message: "Creator not found" });

      const creatorTracks = await storage.getTracksByCreatorId(creatorId);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      let totalPlays = 0;
      let totalLikes = 0;
      let mostPlayedTrack = { title: "-", plays: 0 };
      let mostLikedTrack = { title: "-", likes: 0 };

      const trackStats = [];

      for (const track of creatorTracks) {
        const likeCount = await storage.getLikeCount(track.id);
        totalPlays += track.plays;
        totalLikes += likeCount;

        if (track.plays > mostPlayedTrack.plays) {
          mostPlayedTrack = { title: track.title, plays: track.plays };
        }
        if (likeCount > mostLikedTrack.likes) {
          mostLikedTrack = { title: track.title, likes: likeCount };
        }

        let status = "-";
        const trackAge = (now.getTime() - new Date(track.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (trackAge <= 7) status = "New";

        const trendingTracks = await storage.getTrendingTracks();
        if (trendingTracks.some(t => t.id === track.id)) status = "Trending";

        trackStats.push({
          id: track.id,
          title: track.title,
          plays: track.plays,
          likes: likeCount,
          status,
        });
      }

      const followers = await storage.getFollowerCount(creatorId);
      const conversionRate = totalPlays > 0 ? Math.round((totalLikes / totalPlays) * 100) : 0;

      const top25 = await storage.getTop25ByLikes();
      const allTracks = await storage.getAllTracks();
      const creatorInTop25 = allTracks.length >= 25 && top25.some(t => t.creatorId === creatorId);
      let likesAwayFromTop25 = 0;
      if (!creatorInTop25 && top25.length >= 25) {
        const last = top25[top25.length - 1];
        const lastLikeCount = await storage.getLikeCount(last.id);
        const bestCreatorLikes = trackStats.length > 0 ? Math.max(...trackStats.map(t => t.likes)) : 0;
        likesAwayFromTop25 = Math.max(0, lastLikeCount - bestCreatorLikes + 1);
      }

      let rankStatus = "-";
      if (creatorInTop25) rankStatus = "Top 25";
      const trendingCheck = await storage.getTrendingTracks();
      if (trendingCheck.some(t => t.creatorId === creatorId)) rankStatus = "Trending";

      const nextSunday = new Date(now);
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
      nextSunday.setHours(0, 0, 0, 0);
      const msUntilReset = nextSunday.getTime() - now.getTime();
      const daysUntil = Math.floor(msUntilReset / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.floor((msUntilReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesUntil = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

      res.json({
        thisWeek: {
          plays: totalPlays,
          likes: totalLikes,
          followers,
          rankStatus,
        },
        performance: {
          mostPlayedTrack,
          mostLikedTrack,
          conversionRate,
        },
        tracks: trackStats,
        motivation: {
          likesAwayFromTop25,
          inTop25: creatorInTop25,
        },
        nextReset: {
          days: daysUntil,
          hours: hoursUntil,
          minutes: minutesUntil,
        },
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  app.post("/api/visit", async (_req, res) => {
    try {
      const visitorId = _req.headers["x-visitor-id"] as string;
      if (!visitorId || visitorId.length > 64) {
        return res.status(400).json({ ok: false });
      }
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const recent = await db.select({ id: siteVisits.id })
        .from(siteVisits)
        .where(and(eq(siteVisits.visitorId, visitorId), gt(siteVisits.visitedAt, hourAgo)))
        .limit(1);
      if (recent.length === 0) {
        await db.insert(siteVisits).values({ visitorId });
      }
      res.json({ ok: true });
    } catch {
      res.json({ ok: true });
    }
  });

  app.post("/api/studio-click", async (_req, res) => {
    try {
      const visitorId = (_req.body?.visitorId as string) || (_req.headers["x-visitor-id"] as string);
      if (!visitorId || visitorId.length > 64) {
        return res.status(400).json({ ok: false });
      }
      await db.insert(studioClicks).values({ visitorId });
      res.json({ ok: true });
    } catch {
      res.json({ ok: true });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    const sessionUserId = req.session.userId;
    const headerUserId = parseInt(req.headers["x-user-id"] as string);
    const userId = sessionUserId || headerUserId;
    const ADMIN_USER_IDS = [2];
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!sessionUserId && headerUserId) {
      const adminUser = await db.select().from(users).where(sql`${users.id} = ${userId}`).limit(1);
      if (!adminUser.length) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    try {
      const allTracks = await storage.getAllTracks();
      const allCreators = await storage.getCreators();
      const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
      const [totalPlaysResult] = await db.select({ total: sql<number>`COALESCE(sum(plays), 0)::int` }).from(tracks);
      const [totalLikesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(likes);
      const [totalVisitorLikesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(visitorLikes);
      const [totalCommentsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(comments);
      const [totalFollowsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(follows);
      const [totalVisitorFollowsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(visitorFollows);
      const uniqueVisitorsRows = await db.execute(sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM site_visits`);
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const visitsTodayRows = await db.execute(sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM site_visits WHERE visited_at >= ${todayStart}`);
      const totalVisitsRows = await db.execute(sql`SELECT COUNT(*)::int as count FROM site_visits`);
      const studioClicksRows = await db.execute(sql`SELECT COUNT(*)::int as count FROM studio_clicks`);
      const [totalPlayEventsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(trackPlays);

      const topTracksByPlays = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 10);
      const trackLikeCounts: { id: number; title: string; artist: string; likes: number; plays: number }[] = [];
      for (const t of allTracks) {
        const lc = await storage.getLikeCount(t.id);
        trackLikeCounts.push({ id: t.id, title: t.title, artist: t.artist, likes: lc, plays: t.plays });
      }
      const topTracksByLikes = [...trackLikeCounts].sort((a, b) => b.likes - a.likes).slice(0, 10);

      const creatorStats: { id: number; name: string; trackCount: number; totalPlays: number; totalLikes: number; followers: number }[] = [];
      for (const c of allCreators) {
        const cTracks = allTracks.filter(t => t.creatorId === c.id);
        const cPlays = cTracks.reduce((sum, t) => sum + t.plays, 0);
        let cLikes = 0;
        for (const t of cTracks) {
          cLikes += await storage.getLikeCount(t.id);
        }
        const cFollowers = await storage.getFollowerCount(c.id);
        creatorStats.push({ id: c.id, name: c.name, trackCount: c.trackCount, totalPlays: cPlays, totalLikes: cLikes, followers: cFollowers });
      }
      creatorStats.sort((a, b) => b.totalPlays - a.totalPlays);

      const recentUsers = await db.select().from(users).orderBy(desc(users.id)).limit(10);

      const uniqueVisitors = (uniqueVisitorsRows as any)?.rows?.[0]?.count ?? (uniqueVisitorsRows as any)?.[0]?.count ?? 0;
      const visitorsToday = (visitsTodayRows as any)?.rows?.[0]?.count ?? (visitsTodayRows as any)?.[0]?.count ?? 0;
      const totalVisits = (totalVisitsRows as any)?.rows?.[0]?.count ?? (totalVisitsRows as any)?.[0]?.count ?? 0;
      const totalStudioClicks = (studioClicksRows as any)?.rows?.[0]?.count ?? (studioClicksRows as any)?.[0]?.count ?? 0;

      res.json({
        overview: {
          totalUsers: userCount?.count ?? 0,
          totalCreators: allCreators.length,
          totalTracks: allTracks.length,
          totalPlays: totalPlaysResult?.total ?? 0,
          totalPlayEvents: totalPlayEventsResult?.count ?? 0,
          totalLikes: (totalLikesResult?.count ?? 0) + (totalVisitorLikesResult?.count ?? 0),
          totalComments: totalCommentsResult?.count ?? 0,
          totalFollows: (totalFollowsResult?.count ?? 0) + (totalVisitorFollowsResult?.count ?? 0),
          uniqueVisitors,
          visitorsToday,
          totalVisits,
          studioClicks: totalStudioClicks,
        },
        topTracksByPlays,
        topTracksByLikes,
        creatorStats,
        recentUsers: recentUsers.map(u => ({ id: u.id, name: u.name, email: u.email, creatorId: u.creatorId })),
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to load admin stats" });
    }
  });

  app.post("/api/tracks/:id/dj-intro", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });

      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });

      const forceRegenerate = req.body?.force === true || req.query.force === "true";
      if (track.djIntroUrl && !forceRegenerate) {
        return res.json({ djIntroUrl: track.djIntroUrl });
      }

      let genError = "";
      const djIntroUrl = await generateDjIntro(trackId).catch((err: any) => {
        genError = err?.message || String(err);
        console.error("DJ intro generation error:", genError);
        return null;
      });
      if (!djIntroUrl) {
        return res.status(500).json({ 
          message: "Failed to generate DJ intro", 
          detail: genError || "unknown error"
        });
      }

      res.json({ djIntroUrl });
    } catch (error: any) {
      console.error("DJ intro endpoint error:", error);
      res.status(500).json({ message: "Failed to generate DJ intro", detail: error?.message || "unknown error" });
    }
  });

  app.post("/api/tracks/:id/dj-short-intro", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });

      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });

      const creator = track.creatorId ? await storage.getCreatorById(track.creatorId) : null;
      const creatorName = creator?.djName || creator?.name || track.artist || "Unknown Artist";

      const openaiKeyForScript = process.env.OPENAI_API_KEY;
      let line = "";

      if (openaiKeyForScript) {
        try {
          const genre = track.genre || "";
          const songDesc = track.songDescription || "";
          const shortPrompt = `You are William Allen, a veteran radio DJ from Memphis. Write a SHORT 2-sentence DJ intro for this song. Be warm and personal — mention one thing about the artist or song that makes the listener curious. Your last words MUST be the song title, then STOP. Keep it around 10-12 seconds when spoken aloud.

Song: "${track.title}"
Artist: ${creatorName}
${genre ? `Genre: ${genre}` : ""}
${songDesc ? `About: ${songDesc}` : ""}

ONLY output the spoken words. No quotes, no stage directions.`;

          const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${openaiKeyForScript}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: shortPrompt }],
              max_tokens: 80,
              temperature: 0.9,
            }),
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json() as any;
            const generated = chatData.choices?.[0]?.message?.content?.trim();
            if (generated) line = generated;
          }
        } catch (e) {
          console.warn("Short intro: OpenAI script generation failed, using template");
        }
      }

      if (!line) {
        const shortLines = [
          `Alright y'all, we got ${creatorName} coming through right now, and I'm telling you, you're gonna want to hear this one. This is "${track.title}"`,
          `Man, let me tell you about this next artist. ${creatorName} has been making some serious waves on Hit Wave Media. Here they come with "${track.title}"`,
          `Oh, this one right here. ${creatorName} put something special together and I can't wait for y'all to hear it. This is "${track.title}"`,
        ];
        line = shortLines[Math.floor(Math.random() * shortLines.length)];
      }

      const openaiKey = process.env.OPENAI_API_KEY;
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      const voiceId = process.env.ELEVENLABS_VOICE_ID || "nF3LfwDKm2NpoSYUrBwg";

      if (!elevenLabsKey && !openaiKey) {
        return res.status(500).json({ message: "No TTS API keys available" });
      }

      let audioBuffer: Buffer | null = null;

      if (elevenLabsKey) {
        const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: line + ".",
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.82, similarity_boost: 0.85 },
          }),
        });
        if (ttsRes.ok) {
          audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
        } else {
          console.warn("Short intro: ElevenLabs failed, trying OpenAI TTS");
        }
      }

      if (!audioBuffer && openaiKey) {
        const openaiTtsRes = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "tts-1", voice: "onyx", input: line + "." }),
        });
        if (openaiTtsRes.ok) {
          audioBuffer = Buffer.from(await openaiTtsRes.arrayBuffer());
        }
      }

      if (!audioBuffer) {
        return res.status(500).json({ message: "TTS generation failed" });
      }

      const tempPath = path.join(uploadsDir, `dj-short-${trackId}-${Date.now()}.mp3`);
      fs.writeFileSync(tempPath, audioBuffer);
      const shortIntroUrl = await uploadToCloudinary(tempPath, "video");
      try { fs.unlinkSync(tempPath); } catch {}

      console.log("DJ short intro for track", trackId, ":", line);
      res.json({ djIntroUrl: shortIntroUrl });
    } catch (error: any) {
      console.error("DJ short intro error:", error);
      res.status(500).json({ message: "Failed to generate short intro" });
    }
  });

  app.get("/api/tracks/:id/reel", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return res.status(400).json({ message: "Invalid track ID" });

      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });

      if (!track.djIntroUrl) return res.status(400).json({ message: "No DJ intro available for this track" });
      if (!track.fileUrl) return res.status(400).json({ message: "No audio file for this track" });

      const { execSync } = await import("child_process");

      try {
        execSync("ffmpeg -version", { stdio: "ignore" });
      } catch {
        return res.status(500).json({ message: "ffmpeg is not installed on this server" });
      }

      let logoPath = path.resolve("attached_assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png");
      if (!fs.existsSync(logoPath)) {
        logoPath = path.resolve("dist/public/images/og-preview.png");
      }
      if (!fs.existsSync(logoPath)) {
        logoPath = path.resolve("client/public/images/og-preview.png");
      }
      if (!fs.existsSync(logoPath)) {
        return res.status(500).json({ message: "Logo image not found on server" });
      }
      const tempDir = path.join(uploadsDir, "reels");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const introPath = path.join(tempDir, `intro-${trackId}-${Date.now()}.mp3`);
      const songPath = path.join(tempDir, `song-${trackId}-${Date.now()}.mp3`);
      const combinedAudioPath = path.join(tempDir, `combined-${trackId}-${Date.now()}.mp3`);
      const outputPath = path.join(tempDir, `reel-${trackId}-${Date.now()}.mp4`);

      const introRes = await fetch(track.djIntroUrl);
      if (!introRes.ok) return res.status(500).json({ message: "Failed to fetch DJ intro" });
      fs.writeFileSync(introPath, Buffer.from(await introRes.arrayBuffer()));

      const songRes = await fetch(track.fileUrl);
      if (!songRes.ok) return res.status(500).json({ message: "Failed to fetch song" });
      fs.writeFileSync(songPath, Buffer.from(await songRes.arrayBuffer()));

      const concatListPath = path.join(tempDir, `list-${trackId}-${Date.now()}.txt`);
      fs.writeFileSync(concatListPath, `file '${introPath}'\nfile '${songPath}'`);
      execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -t 60 -c:a libmp3lame -q:a 2 "${combinedAudioPath}"`, { timeout: 30000 });

      execSync(`ffmpeg -y -loop 1 -i "${logoPath}" -i "${combinedAudioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" -shortest -movflags +faststart "${outputPath}"`, { timeout: 60000 });

      let creatorName = track.artist;
      if (track.creatorId) {
        const creator = await storage.getCreatorById(track.creatorId);
        if (creator) creatorName = creator.name;
      }
      const safeTitle = `${track.title} by ${creatorName} - Hit Wave Media`.replace(/[^a-zA-Z0-9 \-_]/g, "").replace(/\s+/g, "_");

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp4"`);
      const stream = fs.createReadStream(outputPath);
      stream.pipe(res);
      stream.on("end", () => {
        try { fs.unlinkSync(introPath); } catch {}
        try { fs.unlinkSync(songPath); } catch {}
        try { fs.unlinkSync(combinedAudioPath); } catch {}
        try { fs.unlinkSync(concatListPath); } catch {}
        try { fs.unlinkSync(outputPath); } catch {}
      });
    } catch (error: any) {
      console.error("Reel generation error:", error);
      res.status(500).json({ message: "Failed to generate reel video" });
    }
  });

  return httpServer;
}
