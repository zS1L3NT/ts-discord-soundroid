import { GuildMember } from "discord.js"
import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "play-again", "more"),
	execute: async helper => {
		const member = helper.message.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			const song = service.queue.at(0)
			if (!song) {
				return helper.respond(ResponseBuilder.bad("No song playing right now"), 5000)
			}

			const [countStr] = helper.input()!

			const count = helper.getNumber(countStr, 1, 0)
			if (count < 1) {
				return helper.respond(ResponseBuilder.bad(`Invalid play count: ${count}`), 5000)
			}

			if (count > 1000) {
				return helper.respond(
					ResponseBuilder.bad(`Play again count cannot exceed 1000`),
					5000
				)
			}

			service.queue.splice(1, 0, ...Array(count).fill(song))
			helper.cache.updateMusicChannel()
			helper.respond(
				ResponseBuilder.good(
					`Playing "${song.title} - ${song.artiste}" again ${count} times`
				),
				5000
			)
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
