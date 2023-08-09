import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "discord.js"
import { CommandPayload } from "nova-bot"

import ApiHelper from "./ApiHelper"

export default class SearchSelectBuilder {
	private static emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

	constructor(
		private apiHelper: ApiHelper,
		private query: string,
		private requester: string,
	) {}

	async buildVideo(): Promise<CommandPayload> {
		const results = await this.apiHelper.searchYoutubeVideos(this.query, this.requester)

		return {
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `YouTube Video search results for: "${this.query}"`,
						iconURL: `https://res.cloudinary.com/zs1l3nt/image/upload/icons/youtube.png`,
					})
					.setColor("#FF0000"),
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder().setCustomId("search-query").addOptions(
						results.map((result, i) => ({
							emoji: SearchSelectBuilder.emojis[i],
							label: result.title.slice(0, 95),
							value: result.url,
							description: result.artiste,
						})),
					),
				),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("search-music")
						.setEmoji("🎵")
						.setLabel("Search YouTube Music")
						.setStyle(ButtonStyle.Primary),
				),
			],
		}
	}

	async buildMusic(): Promise<CommandPayload> {
		const results = await this.apiHelper.searchYoutubeSongs(this.query, this.requester)

		return {
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `YouTube Music search results for: "${this.query}"`,
						iconURL: `https://res.cloudinary.com/zs1l3nt/image/upload/icons/youtubemusic.png`,
					})
					.setColor("#FF0000"),
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder().setCustomId("search-query").addOptions(
						results.map((result, i) => ({
							emoji: SearchSelectBuilder.emojis[i],
							label: result.title.slice(0, 95),
							value: result.url,
							description: result.artiste || "?",
						})),
					),
				),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("search-videos")
						.setEmoji("📺")
						.setLabel("Search YouTube Video")
						.setStyle(ButtonStyle.Primary),
				),
			],
		}
	}
}
