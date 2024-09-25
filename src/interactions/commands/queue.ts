import { BaseCommand, type CommandHelper } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../../data/GuildCache"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import type prisma from "../../prisma"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shows a detailed message about all the songs in the queue",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		helper.respond(await new QueueBuilder(helper.cache, helper.member).build(), 15_000)
	}
}
