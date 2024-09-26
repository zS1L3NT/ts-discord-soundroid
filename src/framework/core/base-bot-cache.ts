import type { GuildCacheClass, SQLiteDatabase } from "@framework"
import { type Client, Collection, type Guild } from "discord.js"

export type BotCacheClass = new (...args: ConstructorParameters<typeof BaseBotCache>) => BotCache

/**
 * A class that contains global information about the Discord Bot.
 * Contains all GuildCache of each guild.
 *
 * Only one instance of this class should exist.
 */
export default abstract class BaseBotCache {
	/**
	 * The collection that contains all GuildCaches.
	 */
	readonly caches = new Collection<string, GuildCache>()

	constructor(
		private readonly GuildCacheClass: GuildCacheClass,
		/**
		 * The Discord Client that is used to interact with the Discord API.
		 */
		public readonly bot: Client,
		public readonly db: SQLiteDatabase,
	) {
		this.onConstruct()
	}

	/**
	 * Get a Guild's cache.
	 *
	 * @param guild Guild class from Discord
	 * @returns A promise that returns the GuildCache of the guild
	 */
	getGuildCache(guild: Guild) {
		return new Promise<GuildCache>((resolve, reject) => {
			const cache = this.caches.get(guild.id)
			if (!cache) {
				const cache = new this.GuildCacheClass(this.bot, guild, this.db)
				this.caches.set(guild.id, cache)
				this.onSetGuildCache(cache)
				cache
					.refresh()
					.then(() => resolve(cache))
					.catch(reject)
			} else {
				resolve(cache)
			}
		})
	}

	/**
	 * A method that is called when the BotCache is constructed.
	 */
	onConstruct() {}

	/**
	 * A method that is called when a GuildCache is stored in the BotCache.
	 *
	 * @param cache The GuildCache that was just created.
	 */
	onSetGuildCache(cache: GuildCache) {}

	/**
	 * Setup the GuildCache and server for a new guild
	 *
	 * @param guildId The ID of the guild that was created
	 */
	abstract registerGuildCache(guildId: string): void

	/**
	 * Destroy the GuildCache and server for the deleted guild
	 *
	 * @param guildId The ID of the guild that was deleted
	 */
	abstract eraseGuildCache(guildId: string): void
}
