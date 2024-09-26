import { BaseButton, type ButtonHelper, ResponseBuilder } from "@framework"

import PageSelectBuilder from "../../builders/page-select-builder"

export default class extends BaseButton {
	override defer = true
	override ephemeral = true

	override middleware = []

	override async execute(helper: ButtonHelper) {
		const embed = helper.message.embeds[0]

		if (!embed) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about queue page number"),
			)
		}

		helper.respond(
			new PageSelectBuilder(embed, helper.message.channel.id, helper.message.id).build(),
		)
	}
}
