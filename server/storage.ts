import { type Track, type InsertTrack, type Creator, type InsertCreator, type Genre, type InsertGenre } from "@shared/schema";
import { tracks, creators, genres } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getTracks(category: string): Promise<Track[]>;
  getAllTracks(): Promise<Track[]>;
  getCreators(): Promise<Creator[]>;
  getCreatorById(id: number): Promise<Creator | undefined>;
  getTracksByArtist(artistName: string): Promise<Track[]>;
  getGenres(): Promise<Genre[]>;
  insertTrack(track: InsertTrack): Promise<Track>;
  insertCreator(creator: InsertCreator): Promise<Creator>;
  insertGenre(genre: InsertGenre): Promise<Genre>;
}

export class DatabaseStorage implements IStorage {
  async getTracks(category: string): Promise<Track[]> {
    if (category === "top25") {
      return db.select().from(tracks).where(eq(tracks.category, "top25")).orderBy(asc(tracks.rank));
    }
    return db.select().from(tracks).where(eq(tracks.category, category)).orderBy(desc(tracks.plays));
  }

  async getAllTracks(): Promise<Track[]> {
    return db.select().from(tracks).orderBy(desc(tracks.plays));
  }

  async getCreators(): Promise<Creator[]> {
    return db.select().from(creators).orderBy(desc(creators.trackCount));
  }

  async getCreatorById(id: number): Promise<Creator | undefined> {
    const [result] = await db.select().from(creators).where(eq(creators.id, id));
    return result;
  }

  async getTracksByArtist(artistName: string): Promise<Track[]> {
    return db.select().from(tracks).where(eq(tracks.artist, artistName)).orderBy(desc(tracks.plays));
  }

  async getGenres(): Promise<Genre[]> {
    return db.select().from(genres);
  }

  async insertTrack(track: InsertTrack): Promise<Track> {
    const [result] = await db.insert(tracks).values(track).returning();
    return result;
  }

  async insertCreator(creator: InsertCreator): Promise<Creator> {
    const [result] = await db.insert(creators).values(creator).returning();
    return result;
  }

  async insertGenre(genre: InsertGenre): Promise<Genre> {
    const [result] = await db.insert(genres).values(genre).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
