CREATE TABLE `servers` (
	`guild_id` text NOT NULL,
	`prefix` text,
	`log_channel_id` text,
	`music_channel_id` text,
	`music_message_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `servers_guild_id_unique` ON `servers` (`guild_id`);