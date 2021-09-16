import { Emoji, iButtonFile } from "../utilities/BotSetupHelper"
import { Message } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	id: "queue-next-page",
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Failed to get information about queue page number"
			))
		}
		const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
		const currentPage = parseInt(pageInfo.split("/")[0])

		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Showing next page"
		))
		await message.edit(
			await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload(currentPage + 1)
		)
	}
} as iButtonFile