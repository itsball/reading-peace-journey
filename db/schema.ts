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
