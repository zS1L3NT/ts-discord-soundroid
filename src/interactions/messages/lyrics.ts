import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import LyricsSelectBuilder from "../../utilities/LyricsSelectBuilder"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "lyrics", "more"),
	execute: async helper => {
		const query = helper.input()!.join(" ")
		const service = helper.cache.service
		if (service) {
			if (service.queue.length === 0 && !query) {
				return helper.respond(
					ResponseBuilder.bad("I am not playing anything right now"),
					5000
				)
			}

			const song = service.queue[0]!

			helper.reactSuccess()
			helper.respond(
				await new LyricsSelectBuilder(
					helper.cache.apiHelper,
					query || `${song.title} - ${song.artiste}`
				).build()
			)
		} else {
			if (query) {
				helper.reactSuccess()
				helper.respond(
					await new LyricsSelectBuilder(helper.cache.apiHelper, `${query}`).build()
				)
			} else {
				helper.respond(
					ResponseBuilder.bad(
						"No song playing right now, please pass in a query to find lyrics"
					),
					5000
				)
			}
		}
	}
}

export default file
