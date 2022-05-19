import { iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import LyricsSelectBuilder from "../../utilities/LyricsSelectBuilder"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "lyrics",
		description: {
			slash: "Shows the lyrics for a song",
			help: [
				"Shows the lyrics for the current song",
				"If `query` given, searches the lyrics of the query instead"
			].join("\n")
		},
		options: [
			{
				name: "query",
				description: {
					slash: "Query for the lyrics",
					help: "The query for the lyrics"
				},
				type: "string",
				requirements: "Text",
				required: false
			}
		]
	},
	execute: async helper => {
		const query = helper.string("query")
		const service = helper.cache.service
		if (service) {
			if (service.queue.length === 0) {
				return helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			}

			const song = service.queue[0]!

			helper.respond(
				await new LyricsSelectBuilder(
					helper.cache.apiHelper,
					query || `${song.title} - ${song.artiste}`
				).build()
			)
		} else {
			if (query) {
				helper.respond(
					await new LyricsSelectBuilder(helper.cache.apiHelper, `${query}`).build()
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

export default file
