import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../data/GuildCache"
import prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		if (helper.cache.service!.queue.length === 0) {
			helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			return false
		}
		return true
	}
}
