import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play-again`),
	execute: async helper => {
		const member = helper.message.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			const song = service.queue.at(0)
			if (!song) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "No song playing right now"),
					5000
				)
			}

			const [countStr] = helper.input()!

			const count = helper.getNumber(countStr, 1, 0)
			if (count < 1) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid play count: ${count}`),
					5000
				)
			}

			if (count > 1000) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Play again count cannot exceed 1000`),
					5000
				)
			}

			service.queue.splice(1, 0, ...Array(count).fill(song))
			helper.cache.updateMusicChannel()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					`Playing "${song.title} - ${song.artiste}" again ${count} times`
				),
				5000
			)
		} else {
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
