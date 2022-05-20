import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true

	override data = {
		name: "pause",
		description: "Pause the current song"
	}

	override middleware = []

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("pause", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.player.pause()

		helper.cache.updateMusicChannel()
		helper.respond(
			helper.type === CommandType.Slash ? ResponseBuilder.good("Paused song") : null
		)
	}
}
