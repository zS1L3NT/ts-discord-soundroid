import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Removes songs from the queue with either the song position or a range",
		options: [
			{
				name: "from",
				description: "The song to remove or the position to start removing from",
				type: "number" as const,
				requirements: "Number that references a song in the queue",
				required: true
			},
			{
				name: "to",
				description:
					"If this is defined, will remove all the songs between `from` defined earlier and this position",
				type: "number" as const,
				requirements: [
					"Number that references a song in the queue",
					"Cannot be smaller than `from` position specified earlier"
				].join("\n"),
				required: false
			}
		]
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const [fromStr, toStr] = helper.args()
		return {
			from: fromStr === undefined ? 0 : isNaN(+fromStr) ? 0 : +fromStr,
			to: toStr === undefined ? null : isNaN(+toStr) ? 0 : +toStr
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		const from = helper.integer("from")!
		const to = helper.integer("to")

		if (from < 1 || from >= service.queue.length) {
			return helper.respond(ResponseBuilder.bad("No such starting position in the queue"))
		}

		if (to) {
			if (to <= from || to >= service.queue.length) {
				return helper.respond(
					ResponseBuilder.bad(
						"Invalid ending position in queue, ensure the end position is greater than the start position"
					)
				)
			}

			const deleteCount = to - from + 1
			service.queue.splice(from, deleteCount)

			helper.cache.updateMinutely()
			helper.respond(ResponseBuilder.good(`Removed ${deleteCount} songs from the queue`))
			helper.cache.logger.log({
				member: helper.member,
				title: `Removed ${deleteCount} songs from the queue`,
				description: [
					`<@${helper.member.id}> removed a range of songs from the queue`,
					`**Start Position**: ${from}`,
					`**End Position**: ${to}`
				].join("\n"),
				command: "remove",
				color: "YELLOW"
			})
		} else {
			const song = service.queue.splice(from, 1)[0]
			if (!song) {
				return helper.respond(ResponseBuilder.bad(`No song at position ${from}`))
			}

			helper.cache.updateMinutely()
			helper.respond(
				ResponseBuilder.good(`Removed 1 song from queue: "${song.title} - ${song.artiste}"`)
			)
			helper.cache.logger.log({
				member: helper.member,
				title: `Removed a song from the queue`,
				description: `<@${helper.member.id}> removed [${song.title} - ${song.artiste}](${song.url}) from the queue\n**Original Index**: ${from}`,
				command: "remove",
				color: "YELLOW"
			})
		}
	}
}
