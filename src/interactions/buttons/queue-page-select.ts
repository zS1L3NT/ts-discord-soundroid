import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import PageSelectBuilder from "../../utils/PageSelectBuilder"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = true
	override ephemeral = true

	override middleware = []

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		const embed = helper.message.embeds[0]

		if (!embed) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about queue page number")
			)
		}

		helper.respond(
			new PageSelectBuilder(embed, helper.message.channel.id, helper.message.id).build()
		)
	}
}
