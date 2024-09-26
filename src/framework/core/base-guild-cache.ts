import { type Client, Colors, type Guild } from "discord.js"

import { LogManager } from "@framework"

export type GuildCacheClass = new (bot: Client, guild: Guild) => GuildCache

/**
 * A class containing information related to each Guild.
 *
 * Each Guild that the bot is in will have its own GuildCache.
 */
export default abstract class BaseGuildCache {
	/**
	 * The instance of the logger for this Guild
	 */
	readonly logger = new LogManager(this)

	/**
	 * Cached server value
	 */
	server = this.getEmptyServer()

	/**
	 * Command aliases
	 */
	aliases: Alias[] = []

	/**
	 * The property determining if the bot has the admin permission in this Guild
	 */
	isAdministrator = false

	constructor(
		/**
		 * The Discord Client that is used to interact with the Discord API.
		 */
		public readonly bot: Client,
		/**
		 * The Discord Guild that this GuildCache is for.
		 */
		public readonly guild: Guild,
	) {
		this.onConstruct()
		setInterval(() => this.refresh(), 15_000)
	}

	/**
	 * The prefix of this Guild
	 */
	get prefix() {
		return this.server.prefix
	}

	/**
	 * Update the server data
	 *
	 * @param data The data that changed in the server
	 */
	async update(data: Partial<Server>) {
		this.server = { ...JSON.parse(JSON.stringify(this.server)), ...data }
		try {
			this.server = await (<any>this.prisma).entry.update({
				data,
				where: { guild_id: this.guild.id },
			})
		} catch (err) {
			this.refresh()
			logger.error(err)
			this.logger.log({
				title: (<Error>err).name,
				description: (<Error>err).message,
				color: Colors.Red,
			})
		}
	}

	/**
	 * A method that is called when the GuildCache is constructed.
	 */
	onConstruct() {}

	/**
	 * This method is where the GuildCache's data is refetched from the database.
	 */
	abstract refresh(): Promise<void>

	/**
	 * A method that is called every minute by the bot
	 */
	abstract updateMinutely(): void

	/**
	 * Get an empty server
	 */
	abstract getEmptyServer(): Server
}
