import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Resume the current song"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"You have to be in a voice channel to use this command"
			))
		}

		if (helper.cache.service) {
			helper.cache.service.player.unpause()
			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Resumed song"
			))
		}
		else {
			helper.respond(new EmbedResponse(
				Emoji.BAD,
				"I am not currently in a voice channel"
			))
		}
	}
} as iInteractionFile