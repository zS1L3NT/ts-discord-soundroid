import { SlashCommandBuilder } from "@discordjs/builders"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("move")
		.setDescription("Change a song's position in the queue")
		.addIntegerOption(option =>
			option
				.setName("from")
				.setDescription("Position of the song to move. If \"to\" is not defined, moves this song to the top")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("to")
				.setDescription("Position to move the song to. The song currently at this position will get pushed down")
				.setRequired(false)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const from = helper.integer("from", true)!
			const to = helper.integer("to")

			const queue = helper.cache.service.queue
			const song = queue[from]

			if (from < 1 || from >= queue.length) {
				return helper.respond(`❌ Invalid \`from\` position: ${from}`)
			}

			if (to && (to < 1 || to > queue.length)) {
				return helper.respond(`❌ Invalid \`to\` position: ${to}`)
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.respond(`✅ Moved \`${song.title} - ${song.artiste}\` from ${from} to ${to ?? `top of the queue`}`)
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile