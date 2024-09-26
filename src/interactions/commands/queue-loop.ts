import { BaseCommand, type CommandHelper, ResponseBuilder } from "@framework"
import { Colors } from "discord.js"

import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Loop the current queue, disables loop mode",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
		const service = helper.cache.service!

		service.loop = false
		service.queueLoop = !service.queueLoop

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Queue Loop ${service.queueLoop ? "enabled" : "disabled"}`),
		)
		helper.cache.logger.log({
			member: helper.member,
			title: `Queue loop ${service.queueLoop ? "enabled" : "disabled"}`,
			description: `<@${helper.member.id}> **${
				service.queueLoop ? "enabled" : "disabled"
			}** queue loop`,
			command: "queue-loop",
			color: Colors.Yellow,
		})
	}
}
