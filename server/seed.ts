import { db } from "./db";
import { tracks, creators, genres } from "@shared/schema";
import { sql } from "drizzle-orm";

async function createTablesIfMissing() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS genres (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      group_name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      creator_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS tracks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      genre TEXT NOT NULL,
      plays INTEGER NOT NULL DEFAULT 0,
      rank INTEGER,
      category TEXT NOT NULL DEFAULT 'trending',
      creator_id INTEGER,
      file_url TEXT,
      cover_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS creators (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      track_count INTEGER NOT NULL DEFAULT 0,
      avatar_color TEXT NOT NULL DEFAULT 'purple',
      user_id INTEGER,
      avatar_url TEXT
    );
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      track_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS visitor_likes (
      id SERIAL PRIMARY KEY,
      track_id INTEGER NOT NULL,
      visitor_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS track_plays (
      id SERIAL PRIMARY KEY,
      track_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS follows (
      id SERIAL PRIMARY KEY,
      follower_id INTEGER NOT NULL,
      creator_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS visitor_follows (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      creator_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      track_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function seedDatabase() {
  await createTablesIfMissing();
  const existingGenres = await db.select().from(genres).limit(1);
  if (existingGenres.length > 0) return;

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
    { name: "Christian Pop", group: "Religious & Spiritual" },
    { name: "Christian Rock", group: "Religious & Spiritual" },
    { name: "Easy Listening Rock", group: "Roots & Other" },
    { name: "Love Songs", group: "Roots & Other" },
  ]);

  console.log("Database seeded successfully");
}
