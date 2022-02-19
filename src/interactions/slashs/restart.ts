import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iSlashFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "restart",
		description: {
			slash: "Restart the current song",
			help: "Restarts the current song. Use this if the song stops playing for no reason"
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
			service.restart()
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Restarted the current song"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
