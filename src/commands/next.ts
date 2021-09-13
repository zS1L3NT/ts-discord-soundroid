import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("next")
		.setDescription("Play the next song in queue"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			helper.cache.service.player.stop()
			helper.respond("✅ Skipped to the next song")
		}
		else {
			helper.respond("❌ I am not currently playing anything")
		}
	}
} as iInteractionFile