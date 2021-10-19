import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription(
			"Remove a song from the queue. If ending is set, removes songs from start to end"
		)
		.addIntegerOption(option =>
			option
				.setName("from")
				.setDescription(
					'Starting position of the song in the queue to remove. If "to" is not defined, removes this song only'
				)
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("to")
				.setDescription("Ending position of the songs in the queue to remove.")
				.setRequired(false)
		),
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

		const from = helper.integer("from")!
		const to = helper.integer("to")

		if (helper.cache.service) {
			if (from < 1 || from >= helper.cache.service.queue.length) {
				helper.respond(
					new EmbedResponse(Emoji.BAD, "No such starting position in the queue")
				)
			} else {
				if (to) {
					if (to <= from || to >= helper.cache.service.queue.length) {
						helper.respond(
							new EmbedResponse(
								Emoji.BAD,
								"Invalid ending position in queue, ensure the end position is greater than the start position"
							)
						)
					} else {
						const delete_count = to - from + 1
						helper.cache.service.queue.splice(from, delete_count)
						helper.cache.updateMusicChannel()
						helper.respond(
							new EmbedResponse(
								Emoji.GOOD,
								`Removed ${delete_count} songs from the queue`
							)
						)
					}
				} else {
					const song = helper.cache.service.queue.splice(from, 1)[0]
					helper.cache.updateMusicChannel()
					helper.respond(
						new EmbedResponse(
							Emoji.GOOD,
							`Removed 1 song from queue: "${song.title} - ${song.artiste}"`
						)
					)
				}
			}
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
} as iInteractionFile
