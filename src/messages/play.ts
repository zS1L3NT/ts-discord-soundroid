import { VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import PlayRequest from "../utilities/PlayRequest"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play`),
	execute: async helper => {
		const member = helper.message.member!
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}

		const [query] = helper.match(`\\${helper.cache.getPrefix()}play *(.*)`)!
		await new PlayRequest(helper, query).run()
	}
} as iMessageFile
