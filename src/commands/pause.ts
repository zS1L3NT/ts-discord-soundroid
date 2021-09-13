import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pause the current track"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			helper.cache.service.player.pause()
			helper.respond("✅ Paused track")
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile