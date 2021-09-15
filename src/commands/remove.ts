import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove a song from the queue. If ending is set, removes songs from start to end")
		.addIntegerOption(option =>
			option
				.setName("starting")
				.setDescription("Starting position of the song in the queue to remove")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("ending")
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

		const starting = helper.integer("starting", true)!
		const ending = helper.integer("ending")

		if (helper.cache.service) {
			if (starting < 1 || starting >= helper.cache.service.queue.length) {
				helper.respond({
					emoji: Emoji.BAD,
					message: "No such starting position in the queue"
				})
			}
			else {
				if (ending) {
					if (ending <= starting || ending >= helper.cache.service.queue.length) {
						helper.respond({
							emoji: Emoji.BAD,
							message: "Invalid ending position in queue, ensure the end position is greater than the start position"
						})
					}
					else {
						const delete_count = (ending - starting) + 1
						helper.cache.service.queue.splice(starting, delete_count)
						helper.respond({
							emoji: Emoji.GOOD,
							message: `Removed ${delete_count} songs from the queue`
						})
					}
				}
				else {
					const song = helper.cache.service.queue.splice(starting, 1)[0]
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