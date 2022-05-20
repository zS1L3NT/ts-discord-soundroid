import { VoiceChannel } from "discord.js"
import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	override handler(helper: CommandHelper<Entry, GuildCache>) {
		if (
			!(helper.member.voice.channel instanceof VoiceChannel) ||
			helper.member.voice.channel.id !== helper.cache.guild.me?.voice?.channel?.id
		) {
			helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				)
			)
			return false
		}
		return true
	}
}
