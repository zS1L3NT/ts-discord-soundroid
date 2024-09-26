import type AppBotCache from "../core/bot-cache"
import type AppGuildCache from "../core/guild-cache"
import type { servers } from "../tables"

declare global {
	type Server = typeof servers.$inferSelect
	type BotCache = AppBotCache
	type GuildCache = AppGuildCache
}
