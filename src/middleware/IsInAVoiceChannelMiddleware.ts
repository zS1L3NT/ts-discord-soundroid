import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "@framework"
import { VoiceChannel } from "discord.js"

export default class extends CommandMiddleware {
	override handler(helper: CommandHelper) {
		if (!(helper.member.voice.channel instanceof VoiceChannel)) {
			helper.respond(
				ResponseBuilder.bad("You have to be a voice channel to use this command"),
			)
			return false
		}
		return true
	}
}
