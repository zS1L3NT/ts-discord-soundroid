import { Client, Collection, Guild } from "discord.js"
import GuildCache from "./GuildCache"
import YoutubeHelper from "../utilities/YoutubeHelper"

export default class BotCache {
	public bot: Client
	private guilds: Collection<string, GuildCache>
	private readonly youtube: YoutubeHelper

	public constructor(bot: Client) {
		this.bot = bot
		this.guilds = new Collection<string, GuildCache>()
		this.youtube = new YoutubeHelper()
	}

	public getGuildCache(guild: Guild): GuildCache {
		const cache = this.guilds.get(guild.id)
		if (!cache) {
			this.guilds.set(guild.id, new GuildCache(
				this.bot,
				guild,
				this.youtube
			))
		}

		return this.guilds.get(guild.id)!
	}
}
