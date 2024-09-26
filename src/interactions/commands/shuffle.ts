import { BaseCommand, type CommandHelper, ResponseBuilder } from "@framework"
import { Colors } from "discord.js"

import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shuffles the songs in the queue",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
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
				.map(({ value }) => value),
		]

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Shuffled Queue"))
		helper.cache.logger.log({
			member: helper.member,
			title: "Shuffled queue",
			description: `<@${helper.member.id}> shuffled the queue`,
			command: "shuffle",
			color: Colors.Yellow,
		})
	}
}
