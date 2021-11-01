import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip current playing song and songs in queue")
		.addIntegerOption(option =>
			option
				.setName("count")
				.setDescription("Number of songs to skip. Defaults to 1 (only skip current song)")
				.setRequired(false)
		),
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
			const count = helper.integer("count") || 1
			if (count < 1) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "Invalid song count to skip"))
			}

			helper.cache.service.queue = helper.cache.service.queue.slice(count - 1)
			helper.cache.service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					"Skipped the current song" +
						(count > 1 ? ` and ${count - 1} songs in the queue` : "")
				)
			)
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
} as iInteractionFile
