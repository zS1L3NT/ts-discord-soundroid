import { Client, Collection, Guild } from "discord.js"
import GuildCache from "./GuildCache"
import ApiHelper from "../utilities/ApiHelper"

export default class BotCache {
	public bot: Client
	private guilds: Collection<string, GuildCache>
	private readonly apiHelper: ApiHelper

	public constructor(bot: Client) {
		this.bot = bot
		this.guilds = new Collection<string, GuildCache>()
		this.apiHelper = new ApiHelper()
	}

	public getGuildCache(guild: Guild): GuildCache {
		const cache = this.guilds.get(guild.id)
		if (!cache) {
			this.guilds.set(guild.id, new GuildCache(
				this.bot,
				guild,
				this.apiHelper
			))
		}

		return this.guilds.get(guild.id)!
	}
}
