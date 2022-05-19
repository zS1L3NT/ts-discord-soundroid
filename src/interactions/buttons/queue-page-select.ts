import { Message } from "discord.js"
import { iButtonFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import PageSelectBuilder from "../../utils/PageSelectBuilder"

const file: iButtonFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about queue page number")
			)
		}

		helper.respond(new PageSelectBuilder(embed, message.channel.id, message.id).build())
	}
}

export default file
