import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "move", "more"),
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
			const queue = service.queue
			const song = queue[from]

			if (from >= queue.length) {
				return helper.respond(ResponseBuilder.bad(`Invalid "from" position: ${from}`), 5000)
			}

			if (to && to > queue.length) {
				return helper.respond(ResponseBuilder.bad(`Invalid "to" position: ${to}`), 5000)
			}

			if (!song) {
				return helper.respond(ResponseBuilder.bad(`No song at position ${from}`), 5000)
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.cache.updateMusicChannel()
			helper.respond(
				ResponseBuilder.good(
					`Moved "${song.title} - ${song.artiste}" from ${from} to ${
						to ?? `top of the queue`
					}`
				),
				5000
			)
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
