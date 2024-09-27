import AfterEvery from "after-every"
import {
	type BitFieldResolvable,
	Client,
	type GatewayIntentsString,
	PermissionFlagsBits,
} from "discord.js"

import {
	type BotCacheClass,
	EventSetupHelper,
	FilesSetupHelper,
	type GuildCacheClass,
	SlashCommandDeployer,
	tryasync,
} from "@framework"

export default abstract class NovaBot {
	/**
	 * The display name of the bot.
	 * This will be logged when the bot is started
	 *
	 * @example "SounDroid#1491"
	 */
	abstract name: string
	/**
	 * The icon of the bot.
	 * This will be shown in the help command of the bot
	 *
	 * @example "https://cdn.discordapp.com/avatars/899858077027811379/56e8665909db40439b09e13627970b62.png?size=128"
	 */
	abstract icon: string
	/**
	 * The directory where Nova will look for button, command, event and selectMenu interactions.
	 * Any folder called `/buttons`, `/commands`, `/events`, `/selectMenus` or `/modals` within this directory will be added to the bot.
	 *
	 * @example path.join(__dirname, "interactions")
	 */
	abstract directory: string
	/**
	 * The client intents that the bot will use.
	 *
	 * {@link https://discordjs.guide/popular-topics/intents.html#privileged-intents}
	 */
	abstract intents: BitFieldResolvable<GatewayIntentsString, number>

	/**
	 * The text that the bot will show when the help command is used.
	 *
	 * You are provided with the GuildCache of the server that requested
	 * the help command for better customizability of the help command per server
	 *
	 * @example cache => `Welcome to SounDroid! My prefix is ${cache.prefix}`
	 */
	abstract helpMessage: (cache: GuildCache) => string

	/**
	 * The GuildCache class that is used by your bot
	 */
	abstract GuildCacheClass: GuildCacheClass
	/**
	 * The BotCache class that is used by your bot
	 */
	abstract BotCacheClass: BotCacheClass

	/**
	 * A logger that can be used by Nova to log events to the console.
	 *
	 * @example
	 * import Tracer from "tracer"
	 *
	 * class MyBot extends NovaBot {
	 *     // ...
	 *     logger = Tracer.console({})
	 *     // ...
	 * }
	 */
	abstract logger: {
		discord: (...args: unknown[]) => void
		info: (...args: unknown[]) => void
		warn: (...args: unknown[]) => void
		error: (...args: unknown[]) => void
	}

	/**
	 * Instance of the drizzle database client
	 */
	abstract drizzle: Database

	/**
	 * This method will get called once your bot receives the "ready" event from Discord
	 *
	 * @param botCache The bot cache that is used by your bot
	 */
	onSetup(botCache: BotCache) {}

	/**
	 * Method to start the bot
	 */
	start() {
		const bot = new Client({ intents: this.intents })
		global.logger = this.logger

		const botCache = new this.BotCacheClass(this.GuildCacheClass, bot, this.drizzle)
		const fsh = new FilesSetupHelper(this.directory, this.icon, this.helpMessage)
		const esh = new EventSetupHelper(botCache, fsh)

		const blacklist: string[] = []

		bot.login(process.env.DISCORD__TOKEN)
		bot.on("ready", () => {
			logger.info(`Logged in as ${this.name}`)

			let i = 0
			const count = bot.guilds.cache.size
			const getTag = () => `[${`${++i}`.padStart(`${count}`.length, "0")}/${count}]`
			Promise.allSettled(
				bot.guilds.cache.map(async guild => {
					const [cache, cerror] = await tryasync(() => botCache.getGuildCache(guild))
					if (cerror) {
						blacklist.push(guild.id)
						return logger.error(
							getTag(),
							`❌ Couldn't find a database record for Guild(${guild.name})`,
							cerror.message,
						)
					}

					const [, derror] = await tryasync(() =>
						new SlashCommandDeployer(guild.id, esh.fsh.commandFiles).deploy(),
					)
					if (derror) {
						blacklist.push(guild.id)
						return logger.error(
							getTag(),
							`❌ Couldn't get Slash Command permission for Guild(${guild.name})`,
							derror.message,
						)
					}

					cache.isAdministrator = guild.roles
						.botRoleFor(bot.user!)!
						.permissions.has(PermissionFlagsBits.Administrator)
					if (cache.isAdministrator) {
						await cache.updateMinutely()
					}

					logger.info(getTag(), `✅ Restored cache for Guild(${guild.name})`)
				}),
			).then(() => {
				logger.info("✅ All bot cache restored")
			})

			this.onSetup(botCache)

			AfterEvery(1).minutes(async () => {
				for (const guild of bot.guilds.cache.toJSON()) {
					if (blacklist.includes(guild.id)) continue
					const cache = await botCache.getGuildCache(guild)
					if (cache.isAdministrator) {
						await cache.updateMinutely()
					}
				}
			})
		})
	}
}
