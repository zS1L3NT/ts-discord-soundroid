import { PermissionFlagsBits } from "discord.js"

import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "@framework"

export default class IsAdminMiddleware extends CommandMiddleware {
	override handler(helper: CommandHelper) {
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
