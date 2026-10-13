CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`song_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `song_id`),
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`genre` text NOT NULL,
	`duration` integer NOT NULL,
	`audio` text NOT NULL,
	`cover` text NOT NULL
);
