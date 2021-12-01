import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import PageSelectBuilder from "../utilities/PageSelectBuilder"
import { Emoji, iButtonFile, ResponseBuilder } from "discordjs-nova"
import { Message } from "discord.js"

const file: iButtonFile<iValue, Document, GuildCache> = {
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

export default file
