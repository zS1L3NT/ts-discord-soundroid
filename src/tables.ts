import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

export const servers = sqliteTable(
	"servers",
	{
		guild_id: text("guild_id").notNull(),
		prefix: text("prefix"),
		log_channel_id: text("log_channel_id"),
		music_channel_id: text("music_channel_id"),
		music_message_id: text("music_message_id"),
	},
	t => ({
		unq: unique().on(t.guild_id),
	}),
)
