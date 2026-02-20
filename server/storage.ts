import { type Track, type InsertTrack, type Creator, type InsertCreator, type Genre, type InsertGenre, type User, type InsertUser, type Like, type InsertLike, type Comment, type InsertComment } from "@shared/schema";
import { tracks, creators, genres, users, likes, comments } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  getTrack(id: number): Promise<Track | undefined>;
  getTracks(category: string): Promise<Track[]>;
  getAllTracks(): Promise<Track[]>;
  getCreators(): Promise<Creator[]>;
  getCreatorById(id: number): Promise<Creator | undefined>;
  getCreatorByUserId(userId: number): Promise<Creator | undefined>;
  getTracksByArtist(artistName: string): Promise<Track[]>;
  getTracksByCreatorId(creatorId: number): Promise<Track[]>;
  getGenres(): Promise<Genre[]>;
  insertTrack(track: InsertTrack): Promise<Track>;
  insertCreator(creator: InsertCreator): Promise<Creator>;
  insertGenre(genre: InsertGenre): Promise<Genre>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCreatorId(userId: number, creatorId: number): Promise<void>;
  incrementCreatorTrackCount(creatorId: number): Promise<void>;
  deleteTrack(trackId: number): Promise<Track | undefined>;
  decrementCreatorTrackCount(creatorId: number): Promise<void>;
  getLikeCount(trackId: number): Promise<number>;
  getUserLike(trackId: number, userId: number): Promise<Like | undefined>;
  addLike(like: InsertLike): Promise<Like>;
  removeLike(trackId: number, userId: number): Promise<void>;
  getComments(trackId: number): Promise<Comment[]>;
  addComment(comment: InsertComment): Promise<Comment>;
  deleteComment(commentId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

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

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    const [result] = await db.select().from(creators).where(eq(creators.userId, userId));
    return result;
  }

  async getTracksByArtist(artistName: string): Promise<Track[]> {
    return db.select().from(tracks).where(eq(tracks.artist, artistName)).orderBy(desc(tracks.plays));
  }

  async getTracksByCreatorId(creatorId: number): Promise<Track[]> {
    return db.select().from(tracks).where(eq(tracks.creatorId, creatorId)).orderBy(desc(tracks.plays));
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async updateUserCreatorId(userId: number, creatorId: number): Promise<void> {
    await db.update(users).set({ creatorId }).where(eq(users.id, userId));
  }

  async incrementCreatorTrackCount(creatorId: number): Promise<void> {
    await db.update(creators).set({ trackCount: sql`${creators.trackCount} + 1` }).where(eq(creators.id, creatorId));
  }

  async deleteTrack(trackId: number): Promise<Track | undefined> {
    const [result] = await db.delete(tracks).where(eq(tracks.id, trackId)).returning();
    return result;
  }

  async decrementCreatorTrackCount(creatorId: number): Promise<void> {
    await db.update(creators).set({ trackCount: sql`GREATEST(${creators.trackCount} - 1, 0)` }).where(eq(creators.id, creatorId));
  }

  async getLikeCount(trackId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(likes).where(eq(likes.trackId, trackId));
    return result[0]?.count ?? 0;
  }

  async getUserLike(trackId: number, userId: number): Promise<Like | undefined> {
    const [result] = await db.select().from(likes).where(and(eq(likes.trackId, trackId), eq(likes.userId, userId)));
    return result;
  }

  async addLike(like: InsertLike): Promise<Like> {
    const [result] = await db.insert(likes).values(like).returning();
    return result;
  }

  async removeLike(trackId: number, userId: number): Promise<void> {
    await db.delete(likes).where(and(eq(likes.trackId, trackId), eq(likes.userId, userId)));
  }

  async getComments(trackId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.trackId, trackId)).orderBy(desc(comments.createdAt));
  }

  async addComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db.insert(comments).values(comment).returning();
    return result;
  }

  async deleteComment(commentId: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, commentId));
  }
}

export const storage = new DatabaseStorage();
