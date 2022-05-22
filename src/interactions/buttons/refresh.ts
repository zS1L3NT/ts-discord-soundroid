import { BaseButton, ButtonHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override middleware = []

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		helper.update(await new QueueBuilder(helper.cache, helper.member).build())
	}
}
