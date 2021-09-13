import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Loop the current song in the queue, disables queue-loop mode"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			helper.cache.service.queue_loop = false
			if (helper.cache.service.loop) {
				helper.cache.service.loop = false
				helper.respond("✅ Loop disabled")
			} else {
				helper.cache.service.loop = true
				helper.respond("✅ Loop enabled")
			}
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile