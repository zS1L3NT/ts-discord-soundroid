import { Colors } from "discord.js"
import { BaseCommand, type CommandHelper, ResponseBuilder } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import type prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Loop the current song in the queue, disables queue-loop mode",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!

		service.queueLoop = false
		service.loop = !service.loop

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good(`Loop ${service.loop ? "enabled" : "disabled"}`))
		helper.cache.logger.log({
			member: helper.member,
			title: `Loop ${service.loop ? "enabled" : "disabled"}`,
			description: `<@${helper.member.id}> **${service.loop ? "enabled" : "disabled"}** loop`,
			command: "loop",
			color: Colors.Yellow,
		})
	}
}
