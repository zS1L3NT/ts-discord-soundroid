import { useTry } from "no-try"
import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import SearchSelectBuilder from "../../utils/SearchSelectBuilder"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override middleware = []

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		const [err, query] = useTry(() => {
			const embed = helper.message.embeds[0]
			const author = embed!.author!.name
			const [, query] = author.match(/results for: "(.*)"$/)!
			return query
		})

		if (err) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about previous search")
			)
		}

		await helper.update(
			await new SearchSelectBuilder(
				helper.cache.apiHelper,
				query!,
				helper.member.id
			).buildVideo()
		)
	}
}
