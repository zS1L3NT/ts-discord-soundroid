import { Emoji, iButtonFile } from "../utilities/BotSetupHelper"
import { Message } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	id: "refresh",
	execute: async helper => {
		const message = helper.interaction.message as Message
		await message.edit(await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload())
		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Refreshed queue message"
		))
	}
} as iButtonFile