import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}skip`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		if (helper.cache.service) {
			const [count_str] = helper.input()!

			const count = helper.getNumber(count_str, 1, 0)
			if (count < 1) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Invalid skip count: ${count}`),
					5000
				)
			}

			const queue = [...helper.cache.service.queue]
			if (count >= queue.length) {
				return helper.respond(
					new EmbedResponse(
						Emoji.BAD,
						`The queue only has ${queue.length} songs, cannot skip ${count} songs`
					)
				)
			}

			helper.cache.service.queue = queue.slice(count - 1)
			if (helper.cache.service.queue_loop) {
				helper.cache.service.queue.push(...queue.slice(0, count - 1))
			}

			helper.cache.service.player.stop()
			helper.reactSuccess()
			helper.cache.updateMusicChannel()
		} else {
			helper.reactFailure()
			helper.respond(
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
