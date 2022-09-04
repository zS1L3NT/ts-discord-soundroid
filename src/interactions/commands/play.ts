import { Colors } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import IsInAVoiceChannelMiddleware from "../../middleware/IsInAVoiceChannelMiddleware"
import prisma from "../../prisma"
import ConversionHelper from "../../utils/ConversionHelper"
import SearchSelectBuilder from "../../utils/SearchSelectBuilder"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Play Song/Playlist/Album from YouTube/Spotify",
		options: [
			{
				name: "query",
				description: "This can be a YouTube/Spotify Song/Playlist/Album or Search Query",
				type: "string" as const,
				requirements: "Text or URL",
				required: true
			}
		]
	}

	override middleware = [new IsInAVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return {
			query: helper.args().join(" ") || ""
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const query = helper.string("query")!

		const [, url] = useTry(() => new URL(query))
		if (url) {
			const [err] = await useTryAsync(async () => {
				const songs = await new ConversionHelper(
					helper.cache.apiHelper,
					url,
					helper.member.id
				).getSongs()
				const [first] = songs

				if (!first) {
					return helper.respond(ResponseBuilder.bad("Playlist is empty"))
				}

				if (!helper.cache.service) {
					const channel = helper.member.voice.channel!
					helper.cache.service = new MusicService(
						joinVoiceChannel({
							channelId: channel.id,
							guildId: channel.guild.id,
							adapterCreator: channel.guild
								.voiceAdapterCreator as DiscordGatewayAdapterCreator,
							selfDeaf: false
						}),
						helper.cache
					)
				}

				const service = helper.cache.service

				service.enqueue(first)
				service.queue.push(...songs.slice(1))

				helper.cache.updateMinutely()
				if (songs.length === 1) {
					helper.respond(
						ResponseBuilder.good(`Enqueued: "${first.title} - ${first.artiste}"`)
					)
					helper.cache.logger.log({
						member: helper.member,
						title: "Enqueued 1 song by song link",
						description: `<@${helper.member.id}> enqueued [${first.title} - ${first.artiste}](${first.url})`,
						command: "play",
						color: Colors.Green
					})
				} else {
					helper.respond(ResponseBuilder.good(`Enqueued ${songs.length + 1} songs`))
					helper.cache.logger.log({
						member: helper.member,
						title: `Enqueued ${songs.length + 1} song by playlist link`,
						description: `<@${helper.member.id}> enqueued songs in a playlist\n**Link**: ${url}`,
						command: "play",
						color: Colors.Green
					})
				}
			})

			if (err) {
				helper.respond(ResponseBuilder.bad(err.message))
				helper.cache.logger.log({
					member: helper.member,
					title: "Error playing songs from url",
					description: err.stack || "No stack trace available",
					command: "play",
					color: Colors.Red
				})
			}
		} else {
			helper.respond(
				await new SearchSelectBuilder(
					helper.cache.apiHelper,
					query,
					helper.member.id
				).buildMusic(),
				null
			)
		}
	}
}
