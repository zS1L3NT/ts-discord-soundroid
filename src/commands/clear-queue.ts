import { SlashCommandBuilder } from "@discordjs/builders"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear-queue")
		.setDescription("Clear the queue and the current song"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			helper.cache.service.queue.length = 0
			helper.cache.service.player.stop()
			helper.respond("✅ Cleared queue")
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile