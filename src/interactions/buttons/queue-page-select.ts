import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"
import PageSelectBuilder from "../../utils/PageSelectBuilder"

export default class extends BaseButton<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true

	override middleware = []

	override async execute(helper: ButtonHelper<typeof prisma, Entry, GuildCache>) {
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
