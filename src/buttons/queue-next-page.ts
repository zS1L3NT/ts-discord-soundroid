import { Emoji, iButtonFile } from "../utilities/BotSetupHelper"
import { Message } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	id: "queue-next-page",
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond({
				emoji: Emoji.BAD,
				message: "Failed to get information about queue page number"
			})
		}
		const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
		const currentPage = parseInt(pageInfo.split("/")[0])

		helper.respond({
			emoji: Emoji.GOOD,
			message: "Showing next page"
		})
		await message.edit(
			await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload(currentPage + 1)
		)
	}
} as iButtonFile