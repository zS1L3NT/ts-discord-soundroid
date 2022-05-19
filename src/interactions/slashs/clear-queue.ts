import { GuildMember } from "discord.js"
import { iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "clear-queue",
		description: {
			slash: "Clear the queue and the current song",
			help: "Clears the entire queue along with the current song"
		}
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			service.queue.length = 0
			service.stopStatus = StopStatus.INTENTIONAL
			service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(ResponseBuilder.good("Cleared queue"))
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
		}
	}
}

export default file
