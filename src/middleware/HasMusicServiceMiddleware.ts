import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../data/GuildCache"
import prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		if (!helper.cache.service) {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
			return false
		}
		return true
	}
}
