import { SlashCommandBuilder } from "@discordjs/builders"
import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear-queue")
		.setDescription("Clear the queue and the current song"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond({
				emoji: Emoji.BAD,
				message: "You have to be in a voice channel to use this command"
			})
		}

		if (helper.cache.service) {
			helper.cache.service.queue.length = 0
			helper.cache.service.player.stop()
			helper.respond({
				emoji: Emoji.GOOD,
				message: "Cleared queue"
			})
		}
		else {
			helper.respond({
				emoji: Emoji.BAD,
				message: "I am not currently in a voice channel"
			})
		}
	}
} as iInteractionFile