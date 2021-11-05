import { Message } from "discord.js"
import { iButtonFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import PageSelectFormatter from "../utilities/PageSelectFormatter"

module.exports = {
	id: "queue-select-menu",
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond(
				new EmbedResponse(Emoji.BAD, "Failed to get information about queue page number")
			)
		}

		helper.respond(new PageSelectFormatter(embed, message.channel.id, message.id).getMessagePayload())
	}
} as iButtonFile
