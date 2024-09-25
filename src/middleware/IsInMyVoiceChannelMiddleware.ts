import { VoiceChannel } from "discord.js"
import { type CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../data/GuildCache"
import type prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
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
