import { channel } from "diagnostics_channel"
import { useTry, useTryAsync } from "no-try"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"
import ConversionHelper from "../../utils/ConversionHelper"
import SearchSelectBuilder from "../../utils/SearchSelectBuilder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "play",
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

	override middleware = [new IsInVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "play", "more")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		return {
			query: helper.input()!.join(" ") || ""
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
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
				helper.cache.updateMusicChannel()

				if (songs.length === 1) {
					helper.respond(
						ResponseBuilder.good(`Enqueued: "${first.title} - ${first.artiste}"`)
					)
				} else {
					helper.respond(ResponseBuilder.good(`Enqueued ${songs.length + 1} songs`))
				}
			})

			if (err) {
				helper.respond(ResponseBuilder.bad(err.message))
			}
		} else {
			helper.respond(
				await new SearchSelectBuilder(
					helper.cache.apiHelper,
					query,
					helper.member.id
				).buildMusic()
			)
		}
	}
}
