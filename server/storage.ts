import { type Track, type InsertTrack, type Creator, type InsertCreator, type Genre, type InsertGenre, type User, type InsertUser, type Like, type InsertLike, type Comment, type InsertComment, type Follow, type InsertFollow, type WeeklyWinner, type InsertWeeklyWinner } from "@shared/schema";
import { tracks, creators, genres, users, likes, comments, visitorLikes, trackPlays, follows, visitorFollows, weeklyWinners } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte } from "drizzle-orm";

export interface IStorage {
  getTrack(id: number): Promise<Track | undefined>;
  getTracks(category: string): Promise<Track[]>;
  getAllTracks(): Promise<Track[]>;
  getNewTracks(): Promise<Track[]>;
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
  incrementPlays(trackId: number): Promise<number>;
  getTop25ByLikes(): Promise<Track[]>;
  getLikeCount(trackId: number): Promise<number>;
  getUserLike(trackId: number, userId: number): Promise<Like | undefined>;
  addLike(like: InsertLike): Promise<Like>;
  removeLike(trackId: number, userId: number): Promise<void>;
  getVisitorLike(trackId: number, visitorId: string): Promise<any>;
  addVisitorLike(data: { trackId: number; visitorId: string }): Promise<any>;
  removeVisitorLike(trackId: number, visitorId: string): Promise<void>;
  logPlay(trackId: number): Promise<void>;
  getTrendingTracks(): Promise<Track[]>;
  getComments(trackId: number): Promise<Comment[]>;
  getCommentCount(trackId: number): Promise<number>;
  addComment(comment: InsertComment): Promise<Comment>;
  deleteComment(commentId: number): Promise<void>;
  updateCreatorAvatar(creatorId: number, avatarUrl: string): Promise<void>;
  getFollowerCount(creatorId: number): Promise<number>;
  getFollowingCount(userId: number): Promise<number>;
  isFollowing(followerId: number, creatorId: number): Promise<boolean>;
  addFollow(followerId: number, creatorId: number): Promise<Follow>;
  removeFollow(followerId: number, creatorId: number): Promise<void>;
  getVisitorFollow(visitorId: string, creatorId: number): Promise<any>;
  addVisitorFollow(visitorId: string, creatorId: number): Promise<any>;
  removeVisitorFollow(visitorId: string, creatorId: number): Promise<void>;
  getWeeklyWinners(): Promise<WeeklyWinner[]>;
  getWeeklyWinnerTrackIds(): Promise<number[]>;
  addWeeklyWinner(winner: InsertWeeklyWinner): Promise<WeeklyWinner>;
  getLatestWeeklyWinner(): Promise<WeeklyWinner | undefined>;
  checkAndCrownWeeklyWinner(): Promise<WeeklyWinner | null>;
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

  async getNewTracks(): Promise<Track[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return db.select().from(tracks).where(gte(tracks.createdAt, sevenDaysAgo)).orderBy(desc(tracks.createdAt));
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

  async incrementPlays(trackId: number): Promise<number> {
    const [result] = await db.update(tracks).set({ plays: sql`${tracks.plays} + 1` }).where(eq(tracks.id, trackId)).returning({ plays: tracks.plays });
    await this.logPlay(trackId);
    return result?.plays ?? 0;
  }

  async logPlay(trackId: number): Promise<void> {
    await db.insert(trackPlays).values({ trackId });
  }

  async getTrendingTracks(): Promise<Track[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayLikes = sql<number>`
      COALESCE((SELECT count(*)::int FROM likes WHERE likes.track_id = ${tracks.id} AND likes.created_at >= ${todayStart}), 0)
      + COALESCE((SELECT count(*)::int FROM visitor_likes WHERE visitor_likes.track_id = ${tracks.id} AND visitor_likes.created_at >= ${todayStart}), 0)
    `;
    const todayPlays = sql<number>`
      COALESCE((SELECT count(*)::int FROM track_plays WHERE track_plays.track_id = ${tracks.id} AND track_plays.created_at >= ${todayStart}), 0)
    `;
    const engagement = sql<number>`(${todayLikes}) + (${todayPlays})`;

    const result = await db
      .select({ track: tracks, engagement })
      .from(tracks)
      .orderBy(desc(engagement), desc(tracks.plays))
      .limit(20);

    return result.map(r => r.track);
  }

  async getTop25ByLikes(): Promise<Track[]> {
    const winnerIds = await this.getWeeklyWinnerTrackIds();
    const totalLikes = sql<number>`COALESCE((SELECT count(*)::int FROM likes WHERE likes.track_id = ${tracks.id}), 0) + COALESCE((SELECT count(*)::int FROM visitor_likes WHERE visitor_likes.track_id = ${tracks.id}), 0)`;
    let query = db
      .select({
        track: tracks,
        likeCount: totalLikes,
      })
      .from(tracks);

    if (winnerIds.length > 0) {
      query = query.where(sql`${tracks.id} NOT IN (${sql.raw(winnerIds.join(","))})`) as any;
    }

    const result = await query
      .orderBy(sql`${totalLikes} DESC`, desc(tracks.plays))
      .limit(25);
    return result.map((r, i) => ({ ...r.track, rank: i + 1 }));
  }

  async getLikeCount(trackId: number): Promise<number> {
    const userLikes = await db.select({ count: sql<number>`count(*)::int` }).from(likes).where(eq(likes.trackId, trackId));
    const vLikes = await db.select({ count: sql<number>`count(*)::int` }).from(visitorLikes).where(eq(visitorLikes.trackId, trackId));
    return (userLikes[0]?.count ?? 0) + (vLikes[0]?.count ?? 0);
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

  async getVisitorLike(trackId: number, visitorId: string): Promise<any> {
    const [result] = await db.select().from(visitorLikes).where(and(eq(visitorLikes.trackId, trackId), eq(visitorLikes.visitorId, visitorId)));
    return result;
  }

  async addVisitorLike(data: { trackId: number; visitorId: string }): Promise<any> {
    const [result] = await db.insert(visitorLikes).values(data).returning();
    return result;
  }

  async removeVisitorLike(trackId: number, visitorId: string): Promise<void> {
    await db.delete(visitorLikes).where(and(eq(visitorLikes.trackId, trackId), eq(visitorLikes.visitorId, visitorId)));
  }

  async getComments(trackId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.trackId, trackId)).orderBy(desc(comments.createdAt));
  }

  async getCommentCount(trackId: number): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(comments).where(eq(comments.trackId, trackId));
    return result?.count ?? 0;
  }

  async addComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db.insert(comments).values(comment).returning();
    return result;
  }

  async deleteComment(commentId: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, commentId));
  }

  async updateCreatorAvatar(creatorId: number, avatarUrl: string): Promise<void> {
    await db.update(creators).set({ avatarUrl }).where(eq(creators.id, creatorId));
  }

  async getFollowerCount(creatorId: number): Promise<number> {
    const [userFollows] = await db.select({ count: sql<number>`count(*)::int` }).from(follows).where(eq(follows.creatorId, creatorId));
    const [vFollows] = await db.select({ count: sql<number>`count(*)::int` }).from(visitorFollows).where(eq(visitorFollows.creatorId, creatorId));
    return (userFollows?.count ?? 0) + (vFollows?.count ?? 0);
  }

  async getFollowingCount(userId: number): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followerId, userId));
    return result?.count ?? 0;
  }

  async isFollowing(followerId: number, creatorId: number): Promise<boolean> {
    const [result] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.creatorId, creatorId)));
    return !!result;
  }

  async addFollow(followerId: number, creatorId: number): Promise<Follow> {
    const [result] = await db.insert(follows).values({ followerId, creatorId }).returning();
    return result;
  }

  async removeFollow(followerId: number, creatorId: number): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.creatorId, creatorId)));
  }

  async getVisitorFollow(visitorId: string, creatorId: number): Promise<any> {
    const [result] = await db.select().from(visitorFollows).where(and(eq(visitorFollows.visitorId, visitorId), eq(visitorFollows.creatorId, creatorId)));
    return result;
  }

  async addVisitorFollow(visitorId: string, creatorId: number): Promise<any> {
    const [result] = await db.insert(visitorFollows).values({ visitorId, creatorId }).returning();
    return result;
  }

  async removeVisitorFollow(visitorId: string, creatorId: number): Promise<void> {
    await db.delete(visitorFollows).where(and(eq(visitorFollows.visitorId, visitorId), eq(visitorFollows.creatorId, creatorId)));
  }

  async getWeeklyWinners(): Promise<WeeklyWinner[]> {
    return db.select().from(weeklyWinners).orderBy(desc(weeklyWinners.weekEnd));
  }

  async getWeeklyWinnerTrackIds(): Promise<number[]> {
    const winners = await db.select({ trackId: weeklyWinners.trackId }).from(weeklyWinners);
    return winners.map(w => w.trackId);
  }

  async addWeeklyWinner(winner: InsertWeeklyWinner): Promise<WeeklyWinner> {
    const [result] = await db.insert(weeklyWinners).values(winner).returning();
    return result;
  }

  async getLatestWeeklyWinner(): Promise<WeeklyWinner | undefined> {
    const [result] = await db.select().from(weeklyWinners).orderBy(desc(weeklyWinners.weekEnd)).limit(1);
    return result;
  }

  async checkAndCrownWeeklyWinner(): Promise<WeeklyWinner | null> {
    const now = new Date();
    const latest = await this.getLatestWeeklyWinner();

    if (latest && latest.weekEnd > now) {
      return null;
    }

    const weekStart = latest ? new Date(latest.weekEnd) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (now < weekEnd) {
      return null;
    }

    const winnerIds = await this.getWeeklyWinnerTrackIds();
    const totalLikes = sql<number>`COALESCE((SELECT count(*)::int FROM likes WHERE likes.track_id = ${tracks.id}), 0) + COALESCE((SELECT count(*)::int FROM visitor_likes WHERE visitor_likes.track_id = ${tracks.id}), 0)`;
    let query = db
      .select({ track: tracks, likeCount: totalLikes })
      .from(tracks);

    if (winnerIds.length > 0) {
      query = query.where(sql`${tracks.id} NOT IN (${sql.raw(winnerIds.join(","))})`) as any;
    }

    const result = await query
      .orderBy(sql`${totalLikes} DESC`, desc(tracks.plays))
      .limit(1);

    if (result.length === 0) return null;

    const topTrack = result[0];
    const winner = await this.addWeeklyWinner({
      trackId: topTrack.track.id,
      trackTitle: topTrack.track.title,
      artist: topTrack.track.artist,
      creatorId: topTrack.track.creatorId,
      weekStart,
      weekEnd,
      likeCount: topTrack.likeCount,
      playCount: topTrack.track.plays,
      coverUrl: topTrack.track.coverUrl,
    });

    return winner;
  }
}

export const storage = new DatabaseStorage();
