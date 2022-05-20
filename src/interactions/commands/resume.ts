import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import IsPlayingMiddleware from "../../middleware/IsPlayingMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Resumes the current song"
	}

	override middleware = [
		new IsInMyVoiceChannelMiddleware(),
		new HasMusicServiceMiddleware(),
		new IsPlayingMiddleware()
	]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("resume", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		service.player.unpause()

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Resumed song"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Resumed song`,
			description: `<@${helper.member.id}> resumed the current song`,
			command: "resume",
			color: "#FFD56D"
		})
	}
}
