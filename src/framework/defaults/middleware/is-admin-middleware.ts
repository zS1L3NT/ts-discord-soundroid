import { PermissionFlagsBits } from "discord.js"

import type { PrismaClient } from "@prisma/client"

import {
	type BaseEntry,
	type BaseGuildCache,
	type CommandHelper,
	CommandMiddleware,
	ResponseBuilder,
} from "@framework"

export default class IsAdminMiddleware<
	P extends PrismaClient,
	E extends BaseEntry,
	GC extends BaseGuildCache<P, E, GC>,
> extends CommandMiddleware<P, E, GC> {
	override handler(helper: CommandHelper<P, E, GC>) {
		if (
			!helper.member.permissions.has(PermissionFlagsBits.Administrator) &&
			helper.member.id !== process.env.DISCORD__DEV_ID
		) {
			helper.respond(ResponseBuilder.bad("Only administrators can use this slash command"))
			return false
		}
		return true
	}
}
