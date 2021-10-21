import { VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	condition: helper => helper.matchOnly("\\.queue"),
	execute: async helper => {
		const member = helper.message.member!
		if (!(member.voice.channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}

		helper.reactSuccess()
		helper.message.channel!.send(
			await new QueueFormatter(
				helper.cache,
				member
			).getMessagePayload()
		)
	}
} as iMessageFile