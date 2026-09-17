import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const readingCheckins = sqliteTable("reading_checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantName: text("participant_name").notNull(),
  participantKey: text("participant_key").notNull(),
  chapter: integer("chapter").notNull(),
  mood: text("mood"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [
  index("reading_checkins_participant_key_idx").on(table.participantKey),
  index("reading_checkins_created_at_idx").on(table.createdAt),
]);

export const rosterMembers = sqliteTable("roster_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantName: text("participant_name").notNull(),
  participantKey: text("participant_key").notNull().unique(),
  region: text("region").notNull(),
  church: text("church").notNull(),
  voice: text("voice").notNull(),
  nature: text("nature").notNull(),
}, table => [index("roster_members_region_idx").on(table.region)]);

export const readingCompletions = sqliteTable("reading_completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantName: text("participant_name").notNull(),
  participantKey: text("participant_key").notNull(),
  roundNumber: integer("round_number").notNull(),
  completionDay: text("completion_day").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
}, table => [
  uniqueIndex("reading_completions_key_round_unique").on(table.participantKey, table.roundNumber),
  uniqueIndex("reading_completions_key_day_unique").on(table.participantKey, table.completionDay),
  index("reading_completions_completed_at_idx").on(table.completedAt),
]);
