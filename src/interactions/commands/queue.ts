import { BaseCommand, type CommandHelper } from "@framework"

import QueueBuilder from "../../builders/queue-builder"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shows a detailed message about all the songs in the queue",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware()]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
		helper.respond(await new QueueBuilder(helper.cache, helper.member).build(), 15_000)
	}
}
