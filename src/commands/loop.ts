import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Toggles between looping and unlooping the current song",
			"If queue-loop is active and you are enabling loop, disables queue-loop"
		].join("\n"),
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Loop the current song in the queue, disables queue-loop mode"),
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

		if (helper.cache.service) {
			helper.cache.service.queue_loop = false
			if (helper.cache.service.loop) {
				helper.cache.service.loop = false
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Loop disabled"))
			} else {
				helper.cache.service.loop = true
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Loop enabled"))
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
