import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "move",
		description: "Move a song in the queue to a specified position",
		options: [
			{
				name: "from",
				description: "This is the song's position in the queue that you want to move",
				type: "number" as const,
				requirements: "Number that references a song in the queue",
				required: true
			},
			{
				name: "to",
				description:
					"Position to move selected song to. Moves selected song to the top of a queue if this isn't provided",
				type: "number" as const,
				requirements: "Number that references a position in the queue",
				required: false,
				default: "1"
			}
		]
	}

	override middleware = [new IsInVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("move", "more")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const [fromStr, toStr] = helper.input()
		return {
			from: fromStr === undefined ? 0 : isNaN(+fromStr) ? 0 : +fromStr,
			to: toStr === undefined ? null : isNaN(+toStr) ? 0 : +toStr
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!
		const queue = service.queue

		const from = helper.integer("from")!
		const to = helper.integer("to")

		if (from < 1 || from >= queue.length) {
			return helper.respond(ResponseBuilder.bad(`Invalid "from" position: ${from}`))
		}

		if (to && (to < 1 || to > queue.length)) {
			return helper.respond(ResponseBuilder.bad(`Invalid "to" position: ${to}`))
		}

		const song = queue[from]
		if (!song) {
			return helper.respond(ResponseBuilder.bad(`No song at position ${from}`))
		}

		queue.splice(to || 1, 0, ...queue.splice(from, 1))

		helper.cache.updateMusicChannel()
		helper.respond(
			ResponseBuilder.good(
				`Moved "${song.title} - ${song.artiste}" from ${from} to ${
					to ?? `the top of the queue`
				}`
			)
		)
	}
}
