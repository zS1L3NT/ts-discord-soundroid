import type AppBotCache from "../core/bot-cache"
import type AppGuildCache from "../core/guild-cache"
import type { db } from "../db"
import type { servers } from "../schema"

declare global {
	type Server = typeof servers.$inferSelect
	type BotCache = AppBotCache
	type GuildCache = AppGuildCache
	type Database = typeof db
}
