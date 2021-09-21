import { GuildMember, Message } from "discord.js"
import { iButtonFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	id: "refresh",
	execute: async helper => {
		const message = helper.interaction.message as Message
		await message.edit(
			await new QueueFormatter(
				helper.cache,
				helper.interaction.member as GuildMember
			).getMessagePayload()
		)
		helper.respond(new EmbedResponse(Emoji.GOOD, "Refreshed queue message"))
	}
} as iButtonFile
