import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "leave-cleanup",
		description: "Clear all songs in the queue from users that have left the voice channel"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("leave-cleanup", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!
		const members = helper.member.voice.channel!.members

		const oldLength = service.queue.length
		service.queue = service.queue.filter((song, i) => i === 0 || !!members.get(song.requester))
		const newLength = service.queue.length

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Cleared ${oldLength - newLength} songs from the queue`)
		)
	}
}
