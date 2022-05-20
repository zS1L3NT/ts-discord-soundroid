import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "resume",
		description: "Resumes the current song"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("resume", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.player.unpause()

		helper.cache.updateMinutely()
		helper.respond(
			helper.type === CommandType.Slash ? ResponseBuilder.good("Resumed song") : null
		)
	}
}
