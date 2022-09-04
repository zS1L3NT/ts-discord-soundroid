import { Colors } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import IsInAVoiceChannelMiddleware from "../../middleware/IsInAVoiceChannelMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description:
			"Plays a YouTube/Spotify Playlist and allows choosing the playlist range (max 1000)",
		options: [
			{
				name: "link",
				description: "The YouTube/Spotify Playlist link",
				type: "string" as const,
				requirements: "URL",
				required: true
			},
			{
				name: "from",
				description: "The first position of the playlist to play from",
				type: "number" as const,
				requirements: "Number that references a song in the Spotify playlist",
				required: false,
				default: "1"
			},
			{
				name: "to",
				description: "The last position of the playlist to play from",
				type: "number" as const,
				requirements: [
					"Number that references a song in the Spotify playlist",
					"Cannot be smaller than `from` position specified earlier",
					"Cannot be more than 1000 songs away from `from` position specified earlier"
				].join("\n"),
				required: false,
				default: "End of the playlist"
			}
		]
	}

	override middleware = [new IsInAVoiceChannelMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const [linkStr, fromStr, toStr] = helper.args()
		return {
			link: linkStr || "",
			from: fromStr === undefined ? 1 : isNaN(+fromStr) ? 0 : +fromStr,
			to: toStr === undefined ? null : isNaN(+toStr) ? 0 : +toStr
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
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

		const link = helper.string("link")!
		let from = helper.integer("from")!
		let to = helper.integer("to")

		const [err, playlistId] = useTry(() => {
			const url = new URL(link)
			if (url.host === "open.spotify.com" && url.pathname.startsWith("/playlist/")) {
				return url.pathname.slice("/playlist/".length)
			}
			if (url.host.endsWith(".youtube.com") && url.pathname === "/playlist") {
				return url.searchParams.get("list")!
			}

			throw new Error()
		})

		if (err) {
			return helper.respond(
				ResponseBuilder.bad("Link must be a Spotify/Youtube playlist link!")
			)
		}

		if (from < 1) {
			return helper.respond(ResponseBuilder.bad(`Invalid "from" position: ${from}`))
		}

		if (to) {
			if (from > to) {
				return helper.respond(
					ResponseBuilder.bad(`Invalid "from" and "to" positions: ${from} and ${to}`)
				)
			}

			if (to - from > 1000) {
				return helper.respond(
					ResponseBuilder.bad(
						`Cannot add more than 1000 songs, bot will take too long to respond`
					)
				)
			}
		}

		const [, spotifyPlaylistLength] = await useTryAsync(() =>
			helper.cache.apiHelper.findSpotifyPlaylistLength(playlistId)
		)
		const [, youtubePlaylistLength] = await useTryAsync(() =>
			helper.cache.apiHelper.findYoutubePlaylistLength(playlistId)
		)
		const length = spotifyPlaylistLength || youtubePlaylistLength

		if (to && to > length) {
			return helper.respond(
				ResponseBuilder.bad(`Invalid "to" position: Playlist only has ${length} songs`)
			)
		}

		if (!to) {
			to = length
		}

		helper.respond(ResponseBuilder.good(`Adding songs from #${from} to #${to}...`))

		const [, spotifyPlaylistSongs] = await useTryAsync(() =>
			helper.cache.apiHelper.findSpotifyPlaylist(playlistId, from, to!, helper.member.id)
		)
		const [, youtubePlaylistSongs] = await useTryAsync(() =>
			helper.cache.apiHelper.findYoutubePlaylist(playlistId, from, to!, helper.member.id)
		)
		const songs = spotifyPlaylistSongs || youtubePlaylistSongs

		helper.cache.service!.enqueue(songs.shift()!)
		helper.cache.service!.queue.push(...songs)

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good(`Enqueued ${songs.length + 1} songs`))
		helper.cache.logger.log({
			member: helper.member,
			title: `Enqueued ${songs.length + 1} songs`,
			description: [
				`<@${helper.member.id}> added ${songs.length + 1} songs to the queue`,
				`**Link**: ${link}`,
				`**Start Position**: ${from}`,
				`**End Position**: ${to}`
			].join("\n"),
			command: "play-range",
			color: Colors.Green
		})
	}
}
