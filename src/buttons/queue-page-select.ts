import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import PageSelectBuilder from "../utilities/PageSelectBuilder"
import { iButtonFile } from "../utilities/BotSetupHelper"
import { Message } from "discord.js"

const file: iButtonFile = {
	defer: true,
	ephemeral: true,
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "Failed to get information about queue page number")
			)
		}

		helper.respond(new PageSelectBuilder(embed, message.channel.id, message.id).build())
	}
}

module.exports = file
