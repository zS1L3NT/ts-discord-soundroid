import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show the queue of songs playing"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		helper.interaction.channel!.send(await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload())
		helper.respond("✅ Showing queue")
	}
} as iInteractionFile