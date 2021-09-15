import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Loop the current song in the queue, disables queue-loop mode"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond({
				emoji: Emoji.BAD,
				message: "You have to be in a voice channel to use this command"
			})
		}

		if (helper.cache.service) {
			helper.cache.service.queue_loop = false
			if (helper.cache.service.loop) {
				helper.cache.service.loop = false
				helper.respond({
					emoji: Emoji.GOOD,
					message: "Loop disabled"
				})
			}
			else {
				helper.cache.service.loop = true
				helper.respond({
					emoji: Emoji.GOOD,
					message: "Loop enabled"
				})
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