import { BaseCommand, CommandHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "queue",
		description: "Shows a detailed message about all the songs in the queue"
	}

	override middleware = [new IsInVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "queue", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		helper.respond(await new QueueBuilder(helper.cache, helper.member).build(), 15_000)
	}
}
