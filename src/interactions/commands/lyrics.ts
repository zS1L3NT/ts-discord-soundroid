import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import LyricsSelectBuilder from "../../utils/LyricsSelectBuilder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: [
			"Shows the lyrics for the current song",
			"If `query` given, searches the lyrics of the query instead"
		].join("\n"),
		options: [
			{
				name: "query",
				description: "The query for the lyrics",
				type: "string" as const,
				requirements: "Text",
				required: false
			}
		]
	}

	override middleware = []

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		return {
			query: helper.args().join(" ")
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const query = helper.string("query")
		const service = helper.cache.service

		if (service) {
			if (service.queue.length === 0 && !query) {
				return helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			}

			const song = service.queue[0]!

			const embed = await new LyricsSelectBuilder(
				helper.cache.apiHelper,
				query || `${song.title} - ${song.artiste}`
			).build()
			helper.respond(embed, embed.components!.length === 0 ? 5000 : null)
		} else {
			if (query) {
				const embed = await new LyricsSelectBuilder(helper.cache.apiHelper, query).build()
				helper.respond(embed, embed.components!.length === 0 ? 5000 : null)
			} else {
				helper.respond(
					ResponseBuilder.bad(
						"No song playing right now, please pass in a query to find lyrics"
					)
				)
			}
		}
	}
}
