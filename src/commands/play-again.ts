import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

const file: iInteractionFile = {
	builder: new SlashCommandBuilder()
		.setName("play-again")
		.setDescription("Play the current song again")
		.addIntegerOption(option =>
			option
				.setName("count")
				.setDescription("Number of times to play the song again. Defaults to 1")
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
			const song = helper.cache.service.queue.at(0)
			if (!song) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "No song playing right now"))
			}

			const count = helper.integer("count") || 1

			if (count < 1) {
				return helper.respond(new EmbedResponse(Emoji.BAD, `Invalid play count: ${count}`))
			}

			if (count > 1000) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Play again count cannot exceed 1000`)
				)
			}

			helper.cache.service.queue.splice(1, 0, ...Array(count).fill(song))
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Playing "${song.title} - ${song.artiste}" again ${count} times`
				)
			)
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
