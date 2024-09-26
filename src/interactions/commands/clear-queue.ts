import { BaseCommand, type CommandHelper, ResponseBuilder } from "@framework"
import { Colors } from "discord.js"

import { StopStatus } from "../../core/music-service"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Clears the entire queue along with the current song",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
		const service = helper.cache.service!

		service.queue.length = 0
		service.stopStatus = StopStatus.INTENTIONAL
		service.player.stop()

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Cleared queue"))
		helper.cache.logger.log({
			member: helper.member,
			title: "Cleared queue",
			description: `<@${helper.member.id}> cleared the queue`,
			command: "clear-queue",
			color: Colors.Yellow,
		})
	}
}
