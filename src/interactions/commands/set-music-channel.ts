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

	override only = CommandType.Slash
	override middleware = [new IsAdminMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const channel = helper.channel("channel")
		const oldChannelId = helper.cache.entry.log_channel_id

		if (channel instanceof TextChannel) {
			if (channel.id === helper.cache.entry.music_channel_id) {
				helper.respond(ResponseBuilder.bad("This channel is already the Music channel!"))
			} else {
				await helper.cache.setMusicChannelId(channel.id)

				helper.cache.updateMinutely()
				helper.respond(
					ResponseBuilder.good(`Music channel reassigned to \`#${channel.name}\``)
				)
				helper.cache.logger.log({
					member: helper.member,
					title: `Music channel changed`,
					description: [
						`<@${helper.member.id}> changed the music channel`,
						oldChannelId ? `**Old Music Channel**: <#${oldChannelId}>` : "",
						`**New Music Channel**: <#${channel.id}>`
					].join("\n"),
					command: "set-music-channel",
					color: "BLUE"
				})
			}
		} else if (channel === null) {
			await helper.cache.setMusicChannelId("")
			helper.respond(ResponseBuilder.good(`Music channel unassigned`))
			helper.cache.logger.log({
				member: helper.member,
				title: `Music channel unassigned`,
				description: `<@${helper.member.id}> unassigned the music channel\b**Old Music Channel**: <#${oldChannelId}>`,
				command: "set-music-channel",
				color: "BLUE"
			})
		} else {
			helper.respond(ResponseBuilder.bad(`Please select a text channel`))
		}
	}
}
