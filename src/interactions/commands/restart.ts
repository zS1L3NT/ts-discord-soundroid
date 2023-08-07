import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Restarts the current song. Use this if the song stops playing for no reason",
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!

		service.restart()
		helper.respond(ResponseBuilder.good("Restarted the current song"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Restarted Song`,
			description: `<@${helper.member.id}> restarted the current song`,
			command: "restart",
			color: Colors.Red,
		})
	}
}
