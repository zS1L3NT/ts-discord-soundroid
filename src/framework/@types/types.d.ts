import type { BaseBotCache, BaseGuildCache, aliases, servers } from "@framework"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

declare global {
	type Alias = typeof aliases.$inferSelect
	type Server = typeof servers.$inferSelect
	type BotCache = BaseBotCache
	type GuildCache = BaseGuildCache
	type Database = BaseSQLiteDatabase<"sync" | "async", void, Record<string, never>>
}
