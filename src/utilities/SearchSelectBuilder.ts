import ApiHelper from "./ApiHelper"
import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageOptions,
	MessageSelectMenu
} from "discord.js"
import { query } from "express"

export default class SearchSelectBuilder {
	private static emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

	private apiHelper: ApiHelper
	private query: string
	private requester: string

	public constructor(apiHelper: ApiHelper, query: string, requester: string) {
		this.apiHelper = apiHelper
		this.query = query
		this.requester = requester
	}

	public async buildVideo(): Promise<MessageOptions> {
		const results = await this.apiHelper.searchYoutubeVideos(this.query, this.requester)

		return {
			embeds: [
				new MessageEmbed()
					.setAuthor(
						`YouTube Video search results for: "${query}"`,
						`https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`
					)
					.setColor("#FF0000")
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageSelectMenu().setCustomId("search-query").addOptions(
						results.map((result, i) => ({
							emoji: SearchSelectBuilder.emojis[i],
							label: result.title,
							value: result.url,
							description: result.artiste
						}))
					)
				),
				new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId("search-songs")
						.setEmoji("🎵")
						.setLabel("Search YouTube Music")
						.setStyle("PRIMARY")
				)
			]
		}
	}

	public async buildMusic(): Promise<MessageOptions> {
		const results = await this.apiHelper.searchYoutubeSongs(this.query, this.requester)

		return {
			embeds: [
				new MessageEmbed()
					.setAuthor(
						`YouTube Music search results for: "${query}"`,
						`https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`
					)
					.setColor("#FF0000")
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageSelectMenu().setCustomId("search-query").addOptions(
						results.map((result, i) => ({
							emoji: SearchSelectBuilder.emojis[i],
							label: result.title,
							value: result.url,
							description: result.artiste
						}))
					)
				),
				new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId("search-videos")
						.setEmoji("📺")
						.setLabel("Search YouTube Video")
						.setStyle("PRIMARY")
				)
			]
		}
	}
}
