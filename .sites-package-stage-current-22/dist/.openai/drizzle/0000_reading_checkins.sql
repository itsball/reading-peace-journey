CREATE TABLE `reading_checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_name` text NOT NULL,
	`participant_key` text NOT NULL,
	`chapter` integer NOT NULL,
	`mood` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reading_checkins_participant_key_idx` ON `reading_checkins` (`participant_key`);
--> statement-breakpoint
CREATE INDEX `reading_checkins_created_at_idx` ON `reading_checkins` (`created_at`);
