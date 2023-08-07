import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shuffles the songs in the queue",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!

		const queue = service.queue
		if (queue.length === 0) {
			return helper.respond(ResponseBuilder.bad("Cannot shuffle an empty queue"))
		}

		service.queue = [
			queue[0]!,
			...queue
				.slice(1)
				.map(value => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value),
		]

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good("Shuffled Queue"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Shuffled queue`,
			description: `<@${helper.member.id}> shuffled the queue`,
			command: "shuffle",
			color: Colors.Yellow,
		})
	}
}
