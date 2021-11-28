import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: false,
	help: {
		description: "Clears the entire queue along with the current song",
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("clear-queue")
		.setDescription("Clear the queue and the current song"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		if (helper.cache.service) {
			helper.cache.service.queue.length = 0
			helper.cache.service.player.stop()
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
