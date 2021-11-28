import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: false,
	help: {
		description: "Shuffles the songs in the queue",
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles the songs in the queue to a random order"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue
			helper.cache.service.queue = [
				queue[0],
				...queue
					.slice(1)
					.map(value => ({ value, sort: Math.random() }))
					.sort((a, b) => a.sort - b.sort)
					.map(({ value }) => value)
			]
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
