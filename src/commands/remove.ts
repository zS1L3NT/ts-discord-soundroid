import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove a song from the queue. If ending is set, removes songs from start to end")
		.addIntegerOption(option =>
			option
				.setName("from")
				.setDescription("Starting position of the song in the queue to remove. If \"to\" is not defined, removes this song only")
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
			return helper.respond({
				emoji: Emoji.BAD,
				message: "You have to be in a voice channel to use this command"
			})
		}

		const from = helper.integer("from", true)!
		const to = helper.integer("to")

		if (helper.cache.service) {
			if (from < 1 || from >= helper.cache.service.queue.length) {
				helper.respond({
					emoji: Emoji.BAD,
					message: "No such starting position in the queue"
				})
			}
			else {
				if (to) {
					if (to <= from || to >= helper.cache.service.queue.length) {
						helper.respond({
							emoji: Emoji.BAD,
							message: "Invalid ending position in queue, ensure the end position is greater than the start position"
						})
					}
					else {
						const delete_count = (to - from) + 1
						helper.cache.service.queue.splice(from, delete_count)
						helper.respond({
							emoji: Emoji.GOOD,
							message: `Removed ${delete_count} songs from the queue`
						})
					}
				}
				else {
					const song = helper.cache.service.queue.splice(from, 1)[0]
					helper.respond({
						emoji: Emoji.GOOD,
						message: `Removed 1 song from queue: "${song.title} - ${song.artiste}"`
					})
				}
			}
		}
		else {
			helper.respond({
				emoji: Emoji.BAD,
				message: "I am not currently in a voice channel"
			})
		}
	}
} as iInteractionFile