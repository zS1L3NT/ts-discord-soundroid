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
			const [count_str] = helper.match(`\\${helper.cache.getPrefix()}skip *(\\S*)`)!

			const count = isNaN(+count_str) ? 1 : +count_str
			if (count < 1) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, "Invalid song count to skip"),
					5000
				)
			}

			helper.cache.service.queue = helper.cache.service.queue.slice(count - 1)
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
