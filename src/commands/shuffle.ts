import { SlashCommandBuilder } from "@discordjs/builders"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles the songs in the queue to a random order"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue
			helper.cache.service.queue = [
				queue[0],
				...queue
					.slice(1)
					.map((value) => ({ value, sort: Math.random() }))
					.sort((a, b) => a.sort - b.sort)
					.map(({ value }) => value)
			]
			helper.respond("✅ Shuffled queue")
		}
		else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile