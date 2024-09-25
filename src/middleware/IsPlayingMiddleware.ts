import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../data/GuildCache"
import type prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		if (helper.cache.service!.queue.length === 0) {
			helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			return false
		}
		return true
	}
}
