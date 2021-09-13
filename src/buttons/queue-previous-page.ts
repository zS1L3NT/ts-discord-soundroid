import { iButtonFile } from "../utilities/BotSetupHelper"
import { Message } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	id: "queue-previous-page",
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond("❌ Failed to get information about queue page number")
		}
		const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
		const currentPage = parseInt(pageInfo.split("/")[0])

		await helper.interaction.editReply(
			await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload(currentPage - 1)
		)
	}
} as iButtonFile