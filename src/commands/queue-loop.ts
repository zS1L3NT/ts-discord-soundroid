import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue-loop")
		.setDescription("Loop the current queue, disables loop mode"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond({
				emoji: Emoji.BAD,
				message: "You have to be in a voice channel to use this command"
			})
		}

		if (helper.cache.service) {
			helper.cache.service.loop = false
			if (helper.cache.service.queue_loop) {
				helper.cache.service.queue_loop = false
				helper.respond({
					emoji: Emoji.GOOD,
					message: "Queue Loop disabled"
				})
			}
			else {
				helper.cache.service.queue_loop = true
				helper.respond({
					emoji: Emoji.GOOD,
					message: "Queue Loop enabled"
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