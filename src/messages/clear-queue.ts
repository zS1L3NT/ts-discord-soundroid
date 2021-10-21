import { VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}clear-queue`),
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

		if (helper.cache.service) {
			helper.cache.service.queue.length = 0
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
