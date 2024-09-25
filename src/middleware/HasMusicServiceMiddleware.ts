import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../data/GuildCache"
import type prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		if (!helper.cache.service) {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
			return false
		}
		return true
	}
}
