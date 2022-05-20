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
		return helper.isMessageCommand("lyrics", "more")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		return {
			query: helper.input().join(" ")
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

			helper.respond(
				await new LyricsSelectBuilder(
					helper.cache.apiHelper,
					query || `${song.title} - ${song.artiste}`
				).build(),
				null
			)
		} else {
			if (query) {
				helper.respond(
					await new LyricsSelectBuilder(helper.cache.apiHelper, `${query}`).build(),
					null
				)
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
