import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iInteractionFile<Entry, GuildCache> = {
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
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			service.queue.length = 0
			service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Cleared queue"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
