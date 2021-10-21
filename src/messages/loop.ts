import { GuildMember, VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchOnly("\\.loop"),
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
			helper.cache.service.queue_loop = false
			if (helper.cache.service.loop) {
				helper.cache.service.loop = false
				helper.respond(new EmbedResponse(Emoji.GOOD, "Loop disabled"), 3000)
			} else {
				helper.cache.service.loop = true
				helper.respond(new EmbedResponse(Emoji.GOOD, "Loop enabled"), 3000)
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
} as iMessageFile
