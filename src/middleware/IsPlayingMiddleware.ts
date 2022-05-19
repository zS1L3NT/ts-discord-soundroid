import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	override handler(helper: CommandHelper<Entry, GuildCache>) {
		if (helper.cache.service!.queue.length === 0) {
			helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			return false
		}
		return true
	}
}
