import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show the queue of songs playing"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		helper.interaction.channel!.send(
			await new QueueFormatter(
				helper.cache,
				helper.interaction.member as GuildMember
			).getMessagePayload()
		)
		helper.respond(new EmbedResponse(Emoji.GOOD, "Showing queue"))
	}
} as iInteractionFile
