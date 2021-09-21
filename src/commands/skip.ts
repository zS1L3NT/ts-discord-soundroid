import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip to the next song in queue"),
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

		if (helper.cache.service) {
			helper.cache.service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(new EmbedResponse(Emoji.GOOD, "Skipped to the next song"))
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
} as iInteractionFile
