import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  group: text("group_name").notNull(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  plays: integer("plays").notNull().default(0),
  rank: integer("rank"),
  category: text("category").notNull().default("trending"),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trackCount: integer("track_count").notNull().default(0),
  avatarColor: text("avatar_color").notNull().default("purple"),
});

export const insertGenreSchema = createInsertSchema(genres).omit({ id: true });
export const insertTrackSchema = createInsertSchema(tracks).omit({ id: true });
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true });

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Genre = typeof genres.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Creator = typeof creators.$inferSelect;
