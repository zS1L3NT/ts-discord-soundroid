import QueueBuilder from "../utilities/QueueBuilder"
import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Shows a detailed message about all the songs in the queue",
			"You are able to refresh the queue to see the up to date version of the queue",
			"You are able to change the page of the queue"
		].join("\n"),
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show the queue of songs playing"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		helper.interaction.channel!.send(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build()
		)
		helper.respond(new ResponseBuilder(Emoji.GOOD, "Showing queue"))
	}
}

module.exports = file
