import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import LyricsSelectBuilder from "../../utilities/LyricsSelectBuilder"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}lyrics`),
	execute: async helper => {
		const query = helper.input()!.join(" ")
		const service = helper.cache.service
		if (service) {
			if (service.queue.length === 0 && !query) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "I am not playing anything right now"),
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
					await new LyricsSelectBuilder(helper.cache.apiHelper, `${query}`).build(),
					60_000
				)
			} else {
				helper.reactFailure()
				helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						"No song playing right now, please pass in a query to find lyrics"
					),
					5000
				)
			}
		}
	}
}

export default file
