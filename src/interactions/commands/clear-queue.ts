import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Clears the entire queue along with the current song"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
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
			color: Colors.Yellow
		})
	}
}
