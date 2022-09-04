import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
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

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const [fromStr, toStr] = helper.args()
		return {
			from: fromStr === undefined ? 0 : isNaN(+fromStr) ? 0 : +fromStr,
			to: toStr === undefined ? null : isNaN(+toStr) ? 0 : +toStr
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
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

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(
				`Moved "${song.title} - ${song.artiste}" from ${from} to ${
					to ?? `the top of the queue`
				}`
			)
		)
		helper.cache.logger.log({
			member: helper.member,
			title: `Moved song in queue`,
			description: [
				`<@${helper.member.id}> moved a song's position in the queue`,
				`**Song**: ${song.title} - ${song.artiste}`,
				`**Old Position**: ${from}`,
				`**New Position**: ${to || "Top of the queue"}`
			].join("\n"),
			command: "move",
			color: Colors.Green
		})
	}
}
