import { TextChannel } from "discord.js"
import {
	BaseCommand, CommandHelper, CommandType, IsAdminMiddleware, ResponseBuilder
} from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "music-channel",
		description: "Set the channel where the bot sends information of playing songs",
		options: [
			{
				name: "channel",
				description:
					"The channel which you would want as the music channel. Leave empty to unset the music channel",
				type: "channel" as const,
				requirements: "Text channel that isn't already the music channel",
				required: false
			}
		]
	}

	override only = CommandType.Message
	override middleware = [new IsAdminMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			if (channel.id === helper.cache.entry.music_channel_id) {
				helper.respond(ResponseBuilder.bad("This channel is already the Music channel!"))
			} else {
				await helper.cache.setMusicChannelId(channel.id)
				helper.cache.updateMusicChannel()
				helper.respond(
					ResponseBuilder.good(`Music channel reassigned to \`#${channel.name}\``)
				)
			}
		} else if (channel === null) {
			await helper.cache.setMusicChannelId("")
			helper.respond(ResponseBuilder.good(`Music channel unassigned`))
		} else {
			helper.respond(ResponseBuilder.bad(`Please select a text channel`))
		}
	}
}
