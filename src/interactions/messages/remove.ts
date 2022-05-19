import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "remove", "more"),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const [fromStr, toStr] = helper.input()!

		const from = helper.getNumber(fromStr, 0, 0)
		if (from < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid "from" position: ${from}`), 5000)
		}

		const to = helper.getNumber(toStr, null, 0)
		if (to && to < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid "to" position: ${to}`), 5000)
		}

		const service = helper.cache.service
		if (service) {
			if (from >= service.queue.length) {
				helper.respond(ResponseBuilder.bad("No such starting position in the queue"), 5000)
			} else {
				if (to) {
					if (to <= from || to >= service.queue.length) {
						helper.respond(
							ResponseBuilder.bad(
								"Invalid ending position in queue, ensure the end position is greater than the start position"
							),
							5000
						)
					} else {
						const deleteCount = to - from + 1
						service.queue.splice(from, deleteCount)
						helper.cache.updateMusicChannel()
						helper.respond(
							ResponseBuilder.good(`Removed ${deleteCount} songs from the queue`),
							5000
						)
					}
				} else {
					const song = service.queue.splice(from, 1)[0]
					if (!song) {
						return helper.respond(
							ResponseBuilder.bad(`No song at position ${from}`),
							5000
						)
					}

					helper.cache.updateMusicChannel()
					helper.respond(
						ResponseBuilder.good(
							`Removed 1 song from queue: "${song.title} - ${song.artiste}"`
						),
						5000
					)
				}
			}
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
