import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "shuffle", "only"),
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

		const service = helper.cache.service
		if (service) {
			const queue = service.queue
			if (queue.length === 0) {
				return helper.respond(ResponseBuilder.bad(`Cannot shuffle an empty queue`), 5000)
			}

			service.queue = [
				queue[0]!,
				...queue
					.slice(1)
					.map(value => ({ value, sort: Math.random() }))
					.sort((a, b) => a.sort - b.sort)
					.map(({ value }) => value)
			]
			helper.reactSuccess()
			helper.clearAfter(5000)
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
