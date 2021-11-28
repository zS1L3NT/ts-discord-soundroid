import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: true,
	help: {
		description: "Plays the current playing song again as many times as specified",
		params: [
			{
				name: "count",
				description: "This is the number of times you want the song to repeat",
				requirements: "Number between 1 and 1000",
				required: false,
				default: "1"
			}
		]
	},
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
