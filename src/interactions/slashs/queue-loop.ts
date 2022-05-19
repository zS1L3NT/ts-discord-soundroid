import { GuildMember } from "discord.js"
import { iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "queue-loop",
		description: {
			slash: "Loop the current queue, disables loop mode",
			help: [
				"Toggles between looping and unlooping the entire queue",
				"If loop is active and you are enabling queue-loop, disables loop"
			].join("\n")
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
			service.loop = false
			if (service.queueLoop) {
				service.queueLoop = false
				helper.respond(ResponseBuilder.good("Queue Loop disabled"))
			} else {
				service.queueLoop = true
				helper.respond(ResponseBuilder.good("Queue Loop enabled"))
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
		}
	}
}

export default file
