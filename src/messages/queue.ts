import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import QueueFormatter from "../utilities/QueueFormatter"
import { iMessageFile } from "../utilities/BotSetupHelper"

const file: iMessageFile = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}queue`),
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

		helper.reactSuccess()
		helper.respond(await new QueueFormatter(helper.cache, member).getMessagePayload())
	}
}

module.exports = file
