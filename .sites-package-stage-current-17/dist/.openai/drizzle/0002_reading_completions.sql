CREATE TABLE `reading_completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_name` text NOT NULL,
	`participant_key` text NOT NULL,
	`round_number` integer NOT NULL,
	`completion_day` text NOT NULL,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reading_completions_key_round_unique` ON `reading_completions` (`participant_key`,`round_number`);
--> statement-breakpoint
CREATE UNIQUE INDEX `reading_completions_key_day_unique` ON `reading_completions` (`participant_key`,`completion_day`);
--> statement-breakpoint
CREATE INDEX `reading_completions_completed_at_idx` ON `reading_completions` (`completed_at`);
