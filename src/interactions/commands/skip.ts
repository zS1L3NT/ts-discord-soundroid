import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "skip",
		description: "Skips songs in the queue as many times as specified",
		options: [
			{
				name: "count",
				description: "The number of times you want to skip the current song",
				type: "number" as const,
				requirements: "Number",
				required: false,
				default: "1"
			}
		]
	}

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "skip", "more")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const [countStr] = helper.input()!
		return {
			count: countStr === undefined ? 1 : isNaN(+countStr) ? 0 : +countStr
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		const count = helper.integer("count") as number
		if (count < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid skip count: ${count}`))
		}

		const queue = [...service.queue]
		if (count >= queue.length && count > 1) {
			return helper.respond(
				ResponseBuilder.bad(
					`The queue only has ${queue.length} songs, cannot skip ${count} songs`
				)
			)
		}

		service.queue = queue.slice(count - 1)
		if (service.queueLoop) {
			service.queue.push(...queue.slice(0, count - 1))
		}

		service.stopStatus = StopStatus.INTENTIONAL
		service.player.stop()

		helper.cache.updateMusicChannel()
		helper.respond(
			ResponseBuilder.good(
				"Skipped the current song" +
					(count > 1 ? ` and ${count - 1} songs in the queue` : "")
			)
		)
	}
}
