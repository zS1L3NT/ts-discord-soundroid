import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shuffles the songs in the queue"
	}

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("shuffle", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		const queue = service.queue
		if (queue.length === 0) {
			return helper.respond(ResponseBuilder.bad("Cannot shuffle an empty queue"))
		}

		service.queue = [
			queue[0]!,
			...queue
				.slice(1)
				.map(value => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value)
		]

		helper.cache.updateMinutely()
		helper.respond(
			helper.type === CommandType.Slash ? ResponseBuilder.good("Shuffled Queue") : null
		)
	}
}
