import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}skip`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			const [count_str] = helper.input()!

			const count = helper.getNumber(count_str, 1, 0)
			if (count < 1) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid skip count: ${count}`),
					5000
				)
			}

			const queue = [...service.queue]
			if (count >= queue.length && count > 1) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`The queue only has ${queue.length} songs, cannot skip ${count} songs`
					)
				)
			}

			service.queue = queue.slice(count - 1)
			if (service.queue_loop) {
				service.queue.push(...queue.slice(0, count - 1))
			}

			service.player.stop()
			helper.reactSuccess()
			helper.cache.updateMusicChannel()
		} else {
			helper.reactFailure()
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
