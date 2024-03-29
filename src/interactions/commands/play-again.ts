import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import IsPlayingMiddleware from "../../middleware/IsPlayingMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
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

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const [countStr] = helper.args()
		return {
			count: countStr === undefined ? 1 : isNaN(+countStr) ? 0 : +countStr,
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!
		const song = service.queue[0]!

		const count = helper.integer("count") || 1

		if (count < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid play count: ${count}`))
		}

		if (count > 1000) {
			return helper.respond(ResponseBuilder.bad(`Play again count cannot exceed 1000`))
		}

		service.queue.splice(1, 0, ...Array(count).fill(song))

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Playing "${song.title} - ${song.artiste}" again ${count} times`),
		)
		helper.cache.logger.log({
			member: helper.member,
			title: `Current song played again`,
			description: `<@${helper.member.id}> played the current song again\n**Times**: ${count}`,
			command: "play-again",
			color: Colors.Green,
		})
	}
}
