import { Client, Guild } from "discord.js"
import MusicService from "./MusicService"
import ApiHelper from "../utilities/ApiHelper"

export default class GuildCache {
	public bot: Client
	public guild: Guild

	public apiHelper: ApiHelper
	public service?: MusicService

	public constructor(
		bot: Client,
		guild: Guild,
		youtube: ApiHelper,
	) {
		this.bot = bot
		this.guild = guild
		this.apiHelper = youtube
	}
}
