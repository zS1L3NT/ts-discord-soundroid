import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { iMessageFile } from "../utilities/BotSetupHelper"

const file: iMessageFile = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}queue-loop`),
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
			helper.cache.service.loop = false
			if (helper.cache.service.queue_loop) {
				helper.cache.service.queue_loop = false
				helper.respond(new EmbedResponse(Emoji.GOOD, "Queue Loop disabled"), 3000)
			} else {
				helper.cache.service.queue_loop = true
				helper.respond(new EmbedResponse(Emoji.GOOD, "Queue Loop enabled"), 3000)
			}
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
}

module.exports = file
