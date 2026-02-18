import { db } from "./db";
import { tracks, creators, genres } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingTracks = await db.select().from(tracks).limit(1);
  if (existingTracks.length > 0) return;

  await db.insert(tracks).values([
    { title: "Neon Ghost", artist: "SynthRaider", genre: "EDM", plays: 19200, category: "trending" },
    { title: "Electric Soul", artist: "NovaBeat", genre: "House", plays: 25700, category: "trending" },
    { title: "Code Dreams", artist: "AI-Muse", genre: "Synthwave", plays: 31300, category: "trending" },
    { title: "Shadow Pulse", artist: "WaveGhost", genre: "Dubstep", plays: 27900, category: "trending" },
    { title: "Digital Love", artist: "PixelKernel", genre: "Future Bass", plays: 36500, category: "trending" },
    { title: "Night Circuit", artist: "NeonForge", genre: "Techno", plays: 14400, category: "trending" },

    { title: "Cyber Dreams", artist: "SonicSyn", genre: "Synthwave", plays: 9800, category: "new" },
    { title: "Electric Horizon", artist: "Nightwavv", genre: "Trance", plays: 8500, category: "new" },
    { title: "Neon City Vibes", artist: "SynthMatic", genre: "EDM", plays: 11200, category: "new" },
    { title: "Midnight Blueprint", artist: "EchoArc", genre: "Lo-Fi", plays: 6100, category: "new" },
    { title: "Starlight Engine", artist: "VantaTune", genre: "Ambient", plays: 7400, category: "new" },

    { title: "Neon Skies", artist: "SynthPilot", genre: "EDM", plays: 28900, rank: 1, category: "top25" },
    { title: "Cyber Flow", artist: "Echon", genre: "House", plays: 24100, rank: 2, category: "top25" },
    { title: "Quantum Drift", artist: "AI-Genesis", genre: "Trance", plays: 22600, rank: 3, category: "top25" },
    { title: "Signal Burn", artist: "BeatCore", genre: "Drum & Bass", plays: 19700, rank: 4, category: "top25" },
    { title: "Glitch Romance", artist: "NeuraGlow", genre: "Future Bass", plays: 18200, rank: 5, category: "top25" },
    { title: "Afterlight", artist: "PulseDriver", genre: "Techno", plays: 16900, rank: 6, category: "top25" },
  ]);

  await db.insert(creators).values([
    { name: "AstralBeat", trackCount: 2, avatarColor: "cyan" },
    { name: "CrystalWave", trackCount: 2, avatarColor: "purple" },
    { name: "EchoDream", trackCount: 2, avatarColor: "pink" },
    { name: "DeepSynth", trackCount: 1, avatarColor: "cyan" },
    { name: "NeonNomad", trackCount: 3, avatarColor: "purple" },
    { name: "SkyKernel", trackCount: 1, avatarColor: "pink" },
  ]);

  await db.insert(genres).values([
    { name: "EDM", group: "Electronic" },
    { name: "House", group: "Electronic" },
    { name: "Techno", group: "Electronic" },
    { name: "Trance", group: "Electronic" },
    { name: "Drum & Bass", group: "Electronic" },
    { name: "Dubstep", group: "Electronic" },
    { name: "Future Bass", group: "Electronic" },
    { name: "Synthwave", group: "Electronic" },
    { name: "Chillstep", group: "Electronic" },
    { name: "Hip Hop", group: "Hip Hop & R&B" },
    { name: "Rap", group: "Hip Hop & R&B" },
    { name: "Trap", group: "Hip Hop & R&B" },
    { name: "R&B", group: "Hip Hop & R&B" },
    { name: "Neo-Soul", group: "Hip Hop & R&B" },
    { name: "Pop", group: "Pop & More" },
    { name: "Dance Pop", group: "Pop & More" },
    { name: "Indie Pop", group: "Pop & More" },
    { name: "Electro Pop", group: "Pop & More" },
    { name: "Rock", group: "Rock & Metal" },
    { name: "Alt Rock", group: "Rock & Metal" },
    { name: "Metal", group: "Rock & Metal" },
    { name: "Industrial", group: "Rock & Metal" },
    { name: "Lo-Fi", group: "Chill & Instrumental" },
    { name: "Ambient", group: "Chill & Instrumental" },
    { name: "Instrumental", group: "Chill & Instrumental" },
    { name: "Cinematic", group: "Chill & Instrumental" },
    { name: "Piano", group: "Chill & Instrumental" },
    { name: "Country", group: "Roots & Other" },
    { name: "Blues", group: "Roots & Other" },
    { name: "Jazz", group: "Roots & Other" },
    { name: "Reggae", group: "Roots & Other" },
    { name: "Experimental", group: "Roots & Other" },
  ]);

  console.log("Database seeded successfully");
}
