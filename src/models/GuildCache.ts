import { Client, Guild } from "discord.js"
import MusicService from "./MusicService"
import YoutubeHelper from "../utilities/YoutubeHelper"

export default class GuildCache {
	public bot: Client
	public guild: Guild

	public youtube: YoutubeHelper
	public service?: MusicService

	public constructor(
		bot: Client,
		guild: Guild,
		youtube: YoutubeHelper,
	) {
		this.bot = bot
		this.guild = guild
		this.youtube = youtube
	}
}
