import { useTry } from "no-try"
import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"
import SearchSelectBuilder from "../../utils/SearchSelectBuilder"

export default class extends BaseButton<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<typeof prisma, Entry, GuildCache>) {
		const [err, query] = useTry(() => {
			const embed = helper.message.embeds[0]
			const author = embed!.author!.name
			const [, query] = author.match(/results for: "(.*)"$/)!
			return query
		})

		if (err) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about previous search"),
			)
		}

		await helper.update(
			await new SearchSelectBuilder(
				helper.cache.apiHelper,
				query!,
				helper.member.id,
			).buildMusic(),
		)
	}
}
