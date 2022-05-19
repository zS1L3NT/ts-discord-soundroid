import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "loop",
		description: "Loop the current song in the queue, disables queue-loop mode"
	}

	override middleware = [new IsInVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "loop", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.queueLoop = false
		service.loop = !service.loop

		helper.cache.updateMusicChannel()
		helper.respond(ResponseBuilder.good(`Loop ${service.loop ? "enabled" : "disabled"}`))
	}
}
