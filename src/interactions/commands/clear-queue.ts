import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "clear-queue",
		description: "Clears the entire queue along with the current song"
	}

	override middleware = [new IsInVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "clear-queue", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.queue.length = 0
		service.stopStatus = StopStatus.INTENTIONAL
		service.player.stop()

		helper.cache.updateMusicChannel()
		helper.respond(
			helper.type === CommandType.Slash ? ResponseBuilder.good("Cleared queue") : null
		)
	}
}
