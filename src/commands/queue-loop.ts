import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Toggles between looping and unlooping the entire queue",
			"If loop is active and you are enabling queue-loop, disables loop"
		].join("\n"),
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("queue-loop")
		.setDescription("Loop the current queue, disables loop mode"),
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
			service.loop = false
			if (service.queue_loop) {
				service.queue_loop = false
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Queue Loop disabled"))
			} else {
				service.queue_loop = true
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Queue Loop enabled"))
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
