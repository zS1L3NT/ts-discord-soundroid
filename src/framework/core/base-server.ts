import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

export const aliases = sqliteTable(
	"aliases",
	{
		guild_id: text("guild_id").notNull(),
		alias: text("alias").notNull(),
		command: text("command").notNull(),
	},
	t => ({
		unq: unique().on(t.guild_id, t.alias, t.command),
	}),
)

export const servers = sqliteTable(
	"servers",
	{
		guild_id: text("guild_id").notNull(),
		prefix: text("prefix"),
		log_channel_id: text("log_channel_id"),
	},
	t => ({
		unq: unique().on(t.guild_id),
	}),
)
