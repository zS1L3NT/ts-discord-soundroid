import { Message } from "discord.js"
import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import PageSelectBuilder from "../../utils/PageSelectBuilder"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = true
	override ephemeral = true

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
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
