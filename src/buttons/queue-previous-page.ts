import { GuildMember, Message } from "discord.js"
import { iButtonFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	id: "queue-previous-page",
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			helper.respond(
				new EmbedResponse(Emoji.BAD, "Failed to get information about queue page number")
			)
		}
		const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
		const currentPage = parseInt(pageInfo.split("/")[0])

		helper.respond(new EmbedResponse(Emoji.GOOD, "Showing previous page"))
		await message.edit(
			await new QueueFormatter(
				helper.cache,
				helper.interaction.member as GuildMember
			).getMessagePayload(currentPage - 1)
		)
	}
} as iButtonFile
