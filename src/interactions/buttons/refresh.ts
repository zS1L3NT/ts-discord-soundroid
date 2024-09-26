import { BaseButton, type ButtonHelper } from "@framework"

import QueueBuilder from "../../builders/queue-builder"

export default class extends BaseButton {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper) {
		helper.update(await new QueueBuilder(helper.cache, helper.member).build())
	}
}
