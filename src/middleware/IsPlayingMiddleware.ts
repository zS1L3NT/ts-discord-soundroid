import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "@framework"

export default class extends CommandMiddleware {
	override handler(helper: CommandHelper) {
		if (helper.cache.service!.queue.length === 0) {
			helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			return false
		}
		return true
	}
}
