import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "@framework"
import { VoiceChannel } from "discord.js"

export default class extends CommandMiddleware {
	override handler(helper: CommandHelper) {
		if (
			!(helper.member.voice.channel instanceof VoiceChannel) ||
			helper.member.voice.channel.id !== helper.cache.guild.members.me!.voice?.channel?.id
		) {
			helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command",
				),
			)
			return false
		}
		return true
	}
}
