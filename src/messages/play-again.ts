import { GuildMember } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play-again`),
	execute: async helper => {
		const member = helper.message.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		if (helper.cache.service) {
			const song = helper.cache.service.queue.at(0)
			if (!song) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, "No song playing right now"),
					5000
				)
			}

			const [count_str] = helper.input()!

			const count = helper.getNumber(count_str, 1, 0)
			if (count < 1) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Invalid play count: ${count}`),
					5000
				)
			}

			if (count > 1000) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Play again count cannot exceed 1000`),
					5000
				)
			}

			helper.cache.service.queue.splice(1, 0, ...Array(count).fill(song))
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Playing "${song.title} - ${song.artiste}" again ${count} times`
				),
				5000
			)
		} else {
			helper.respond(
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
