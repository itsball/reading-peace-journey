import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
