import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	override handler(helper: CommandHelper<Entry, GuildCache>) {
		if (!helper.cache.service) {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
			return false
		}
		return true
	}
}
