import { BaseButton, type ButtonHelper, ResponseBuilder, trysync } from "@framework"

import SearchSelectBuilder from "../../builders/search-select-builder"

export default class extends BaseButton {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper) {
		const [query, qerror] = trysync(() => {
			const embed = helper.message.embeds[0]
			const author = embed!.author!.name
			const [, query] = author.match(/results for: "(.*)"$/)!
			return query
		})

		if (qerror) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about previous search"),
			)
		}

		await helper.update(
			await new SearchSelectBuilder(
				helper.cache.apiHelper,
				query!,
				helper.member.id,
			).buildVideo(),
		)
	}
}
