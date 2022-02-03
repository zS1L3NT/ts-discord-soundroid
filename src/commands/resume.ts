import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "resume",
		description: {
			slash: "Resume the current song",
			help: "Resumes the current song"
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
			service.player.unpause()
			helper.cache.updateMusicChannel()
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Resumed song"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
