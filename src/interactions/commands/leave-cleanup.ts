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
		description: "Clear all songs in the queue from users that have left the voice channel"
	}

	override middleware = [new IsInMyVoiceChannelMiddleware(), new HasMusicServiceMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const service = helper.cache.service!
		const members = helper.member.voice.channel!.members

		const oldLength = service.queue.length
		service.queue = service.queue.filter((song, i) => i === 0 || !!members.get(song.requester))
		const newLength = service.queue.length

		helper.cache.updateMinutely()
		helper.respond(
			ResponseBuilder.good(`Cleared ${oldLength - newLength} songs from the queue`)
		)
		helper.cache.logger.log({
			member: helper.member,
			title: `Leave cleanup used`,
			description: `<@${helper.member.id}> activated leave cleanup\n**Songs removed**: ${
				oldLength - newLength
			}`,
			command: "leave-cleanup",
			color: Colors.Yellow
		})
	}
}
