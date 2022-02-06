import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import PageSelectBuilder from "../../utilities/PageSelectBuilder"
import { Emoji, iButtonFile, ResponseBuilder } from "nova-bot"
import { Message } from "discord.js"

const file: iButtonFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	execute: async helper => {
		const message = helper.interaction.message as Message
		const embed = message.embeds[0]

		if (!embed) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Failed to get information about queue page number")
			)
		}

		helper.respond(new PageSelectBuilder(embed, message.channel.id, message.id).build())
	}
}

export default file
