import type { BaseBotCache, BaseGuildCache, aliases, servers } from "@framework"

declare global {
	type Alias = typeof aliases.$inferSelect
	type Server = typeof servers.$inferSelect
	type BotCache = BaseBotCache
	type GuildCache = BaseGuildCache
}
