import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { iMessageFile } from "../utilities/BotSetupHelper"

const file: iMessageFile = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}resume`),
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
			helper.cache.service.player.unpause()
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
