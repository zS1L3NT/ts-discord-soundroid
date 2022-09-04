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
		description: "Pause the current song"
	}

	override middleware = [
		new IsInMyVoiceChannelMiddleware(),
		new HasMusicServiceMiddleware(),
		new IsPlayingMiddleware()
	]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!

		service.player.pause()

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Paused song"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Paused song`,
			description: `<@${helper.member.id}> paused the current song`,
			command: "pause",
			color: Colors.Yellow
		})
	}
}
