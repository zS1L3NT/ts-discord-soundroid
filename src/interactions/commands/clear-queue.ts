import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Clears the entire queue along with the current song"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.queue.length = 0
		service.stopStatus = StopStatus.INTENTIONAL
		service.player.stop()

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Cleared queue"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Cleared queue`,
			description: `<@${helper.member.id}> cleared the queue`,
			command: "clear-queue",
			color: "#FFD56D"
		})
	}
}
