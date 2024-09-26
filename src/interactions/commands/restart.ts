import { BaseCommand, type CommandHelper, ResponseBuilder } from "@framework"
import { Colors } from "discord.js"

import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Restarts the current song. Use this if the song stops playing for no reason",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
		const service = helper.cache.service!

		service.restart()
		helper.respond(ResponseBuilder.good("Restarted the current song"))
		helper.cache.logger.log({
			member: helper.member,
			title: "Restarted Song",
			description: `<@${helper.member.id}> restarted the current song`,
			command: "restart",
			color: Colors.Red,
		})
	}
}
