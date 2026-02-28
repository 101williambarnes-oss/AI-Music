import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  group: text("group_name").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  creatorId: integer("creator_id"),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  plays: integer("plays").notNull().default(0),
  rank: integer("rank"),
  category: text("category").notNull().default("trending"),
  creatorId: integer("creator_id"),
  fileUrl: text("file_url"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trackCount: integer("track_count").notNull().default(0),
  avatarColor: text("avatar_color").notNull().default("purple"),
  userId: integer("user_id"),
  avatarUrl: text("avatar_url"),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const visitorLikes = pgTable("visitor_likes", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trackPlays = pgTable("track_plays", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const visitorFollows = pgTable("visitor_follows", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weeklyWinners = pgTable("weekly_winners", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  trackTitle: text("track_title").notNull(),
  artist: text("artist").notNull(),
  creatorId: integer("creator_id"),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWeeklyWinnerSchema = createInsertSchema(weeklyWinners).omit({ id: true, createdAt: true });
export const insertGenreSchema = createInsertSchema(genres).omit({ id: true });
export const insertTrackSchema = createInsertSchema(tracks).omit({ id: true, createdAt: true });
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, creatorId: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export const insertVisitorLikeSchema = createInsertSchema(visitorLikes).omit({ id: true, createdAt: true });
export const insertTrackPlaySchema = createInsertSchema(trackPlays).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertVisitorLike = z.infer<typeof insertVisitorLikeSchema>;
export type InsertTrackPlay = z.infer<typeof insertTrackPlaySchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Genre = typeof genres.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Creator = typeof creators.$inferSelect;
export type VisitorLike = typeof visitorLikes.$inferSelect;
export type TrackPlay = typeof trackPlays.$inferSelect;
export type User = typeof users.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type WeeklyWinner = typeof weeklyWinners.$inferSelect;
export type InsertWeeklyWinner = z.infer<typeof insertWeeklyWinnerSchema>;
