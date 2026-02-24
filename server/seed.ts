import { db } from "./db";
import { tracks, creators, genres } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
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
    { name: "Gospel", group: "Religious & Spiritual" },
    { name: "Christian Pop", group: "Religious & Spiritual" },
    { name: "Christian Rock", group: "Religious & Spiritual" },
    { name: "Worship", group: "Religious & Spiritual" },
    { name: "Hymns", group: "Religious & Spiritual" },
    { name: "Christian Hip Hop", group: "Religious & Spiritual" },
  ]);

  console.log("Database seeded successfully");
}
