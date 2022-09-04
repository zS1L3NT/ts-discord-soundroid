import { VoiceChannel } from "discord.js"
import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../data/GuildCache"
import prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		if (!(helper.member.voice.channel instanceof VoiceChannel)) {
			helper.respond(
				ResponseBuilder.bad("You have to be a voice channel to use this command")
			)
			return false
		}
		return true
	}
}
