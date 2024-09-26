import { BaseCommand, type CommandHelper, ResponseBuilder } from "@framework"
import { Colors } from "discord.js"

import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import IsPlayingMiddleware from "../../middleware/IsPlayingMiddleware"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Plays the current playing song again as many times as specified",
		options: [
			{
				name: "count",
				description: "This is the number of times you want the song to play again",
				type: "number" as const,
				requirements: "Number between 1 and 1000",
				required: false,
				default: "1",
			},
		],
	}

	override middleware = [
		new IsInMyVoiceChannelMiddleware(),
		new HasMusicServiceMiddleware(),
		new IsPlayingMiddleware(),
	]

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper) {
		const [countStr] = helper.args()
		return {
			count: countStr === undefined ? 1 : Number.isNaN(+countStr) ? 0 : +countStr,
		}
	}

	override async execute(helper: CommandHelper) {
		const service = helper.cache.service!
		const song = service.queue[0]!

		const count = helper.integer("count") || 1

		if (count < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid play count: ${count}`))
		}

		if (count > 1000) {
			return helper.respond(ResponseBuilder.bad("Play again count cannot exceed 1000"))
		}

		service.queue.splice(1, 0, ...Array(count).fill(song))

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Playing "${song.title} - ${song.artiste}" again ${count} times`),
		)
		helper.cache.logger.log({
			member: helper.member,
			title: "Current song played again",
			description: `<@${helper.member.id}> played the current song again\n**Times**: ${count}`,
			command: "play-again",
			color: Colors.Green,
		})
	}
}
