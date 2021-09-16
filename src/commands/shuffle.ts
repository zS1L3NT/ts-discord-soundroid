import { SlashCommandBuilder } from "@discordjs/builders"
import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles the songs in the queue to a random order"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"You have to be in a voice channel to use this command"
			))
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
			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Shuffled queue"
			))
		}
		else {
			helper.respond(new EmbedResponse(
				Emoji.BAD,
				"I am not currently in a voice channel"
			))
		}
	}
} as iInteractionFile