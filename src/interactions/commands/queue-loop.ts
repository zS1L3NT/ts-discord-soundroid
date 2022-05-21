import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Loop the current queue, disables loop mode"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.loop = false
		service.queueLoop = !service.queueLoop

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Queue Loop ${service.queueLoop ? "enabled" : "disabled"}`)
		)
		helper.cache.logger.log({
			member: helper.member,
			title: `Queue loop ${service.queueLoop ? "enabled" : "disabled"}`,
			description: `<@${helper.member.id}> **${
				service.queueLoop ? "enabled" : "disabled"
			}** queue loop`,
			command: "queue-loop",
			color: "YELLOW"
		})
	}
}
