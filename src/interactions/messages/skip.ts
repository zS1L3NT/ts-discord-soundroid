import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "skip", "more"),
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
			const [countStr] = helper.input()!

			const count = helper.getNumber(countStr, 1, 0)
			if (count < 1) {
				return helper.respond(ResponseBuilder.bad(`Invalid skip count: ${count}`), 5000)
			}

			const queue = [...service.queue]
			if (count >= queue.length && count > 1) {
				return helper.respond(
					ResponseBuilder.bad(
						`The queue only has ${queue.length} songs, cannot skip ${count} songs`
					),
					5000
				)
			}

			service.queue = queue.slice(count - 1)
			if (service.queueLoop) {
				service.queue.push(...queue.slice(0, count - 1))
			}

			service.stopStatus = StopStatus.INTENTIONAL
			service.player.stop()
			helper.reactSuccess()
			helper.clearAfter(5000)
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
