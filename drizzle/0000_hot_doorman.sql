CREATE TABLE `aliases` (
	`guild_id` text NOT NULL,
	`alias` text NOT NULL,
	`command` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`guild_id` text NOT NULL,
	`prefix` text,
	`log_channel_id` text,
	`music_channel_id` text,
	`music_message_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aliases_guild_id_alias_command_unique` ON `aliases` (`guild_id`,`alias`,`command`);--> statement-breakpoint
CREATE UNIQUE INDEX `servers_guild_id_unique` ON `servers` (`guild_id`);