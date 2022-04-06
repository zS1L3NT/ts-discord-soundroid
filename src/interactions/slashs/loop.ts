import { GuildMember } from "discord.js"
import { Emoji, iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "loop",
		description: {
			slash: "Loop the current song in the queue, disables queue-loop mode",
			help: [
				"Toggles between looping and unlooping the current song",
				"If queue-loop is active and you are enabling loop, disables queue-loop"
			].join("\n")
		}
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			service.queueLoop = false
			if (service.loop) {
				service.loop = false
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Loop disabled"))
			} else {
				service.loop = true
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Loop enabled"))
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
