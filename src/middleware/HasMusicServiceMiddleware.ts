import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "@framework"

export default class extends CommandMiddleware {
	override handler(helper: CommandHelper) {
		if (!helper.cache.service) {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
			return false
		}
		return true
	}
}
