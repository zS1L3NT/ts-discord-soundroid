import { MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu } from "discord.js"
import { Emoji, ResponseBuilder } from "nova-bot"

import ApiHelper from "./ApiHelper"

export default class LyricsSelectBuilder {
	private static emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

	public constructor(private apiHelper: ApiHelper, private query: string) {}

	public async build(): Promise<MessageOptions> {
		const results = await this.apiHelper.searchGeniusLyrics(this.query)

		if (results.length === 0) {
			return {
				embeds: [
					new ResponseBuilder(
						Emoji.BAD,
						`Could not find any lyrics results for: "${this.query}"`
					).build()
				]
			}
		}

		return {
			embeds: [
				new MessageEmbed()
					.setAuthor({
						name: `Genius Lyrics search results for: "${this.query}"`,
						iconURL: `https://images.genius.com/46745a9c2abdf8c1ce02db009ecfd82f.300x300x1.png`
					})
					.setColor("#FFFF64")
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageSelectMenu().setCustomId("lyrics-query").addOptions(
						results.map((result, i) => ({
							emoji: LyricsSelectBuilder.emojis[i],
							label: result.title.slice(0, 100),
							value: result.id,
							description: result.artiste.slice(0, 100)
						}))
					)
				)
			]
		}
	}
}
