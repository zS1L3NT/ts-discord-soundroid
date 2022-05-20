import { BaseCommand, CommandHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shows a detailed message about all the songs in the queue"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("queue", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		helper.respond(await new QueueBuilder(helper.cache, helper.member).build(), 15_000)
	}
}
