import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import MusicService from "../models/MusicService"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "play-range",
		description: {
			slash: "Plays a YouTube/Spotify Playlist and allows choosing the playlist range",
			help: [
				"Plays a YouTube/Spotify Playlist by it's link",
				"You can define a range to play the playlist",
				"Cannot add more than 1000 songs"
			].join("\n")
		},
		options: [
			{
				name: "link",
				description: {
					slash: "YouTube/Spotify Playlist link",
					help: "The YouTube/Spotify Playlist link"
				},
				type: "string",
				requirements: "URL",
				required: true
			},
			{
				name: "from",
				description: {
					slash: "First position of the playlist to play from",
					help: "The first position of the playlist to play from"
				},
				type: "number",
				requirements: "Number that references a song in the Spotify playlist",
				required: false,
				default: "1"
			},
			{
				name: "to",
				description: {
					slash: "Last position of the playlist to play from",
					help: "The last position of the playlist to play from"
				},
				type: "number",
				requirements: [
					"Number that references a song in the Spotify playlist",
					"Cannot be smaller than `from` position specified earlier",
					"Cannot be more than 1000 songs away from `from` position specified earlier"
				].join("\n"),
				required: false,
				default: "End of the playlist"
			}
		]
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		if (!helper.cache.service) {
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
				new ResponseBuilder(Emoji.BAD, "Link must me a Spotify playlist link")
			)
		}

		let from = helper.integer("from") || 1
		let to = helper.integer("to")

		if (from < 1) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, `Invalid "from" position: ${from}`)
			)
		}

		if (to) {
			if (from > to) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`Invalid "from" and "to" positions: ${from} and ${to}`
					)
				)
			}

			if (to - from > 1000) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`Cannot add more than 1000 songs, bot will take too long to respond`
					)
				)
			}
		}

		const [, sp_length] = await useTryAsync(() =>
			helper.cache.apiHelper.findSpotifyPlaylistLength(playlistId)
		)
		const [, yt_length] = await useTryAsync(() =>
			helper.cache.apiHelper.findYoutubePlaylistLength(playlistId)
		)
		const length = sp_length || yt_length

		if (to && to > length) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					`Invalid "to" position: Playlist only has ${length} songs`
				)
			)
		}

		if (!to) {
			to = length
		}

		helper.respond(new ResponseBuilder(Emoji.GOOD, `Adding songs from #${from} to #${to}...`))

		const [, sp_songs] = await useTryAsync(() =>
			helper.cache.apiHelper.findSpotifyPlaylist(playlistId, from, to!, member.id)
		)
		const [, yt_songs] = await useTryAsync(() =>
			helper.cache.apiHelper.findYoutubePlaylist(playlistId, from, to!, member.id)
		)
		const songs = sp_songs || yt_songs

		helper.cache.service!.enqueue(songs.shift()!)
		helper.cache.service!.queue.push(...songs)
		helper.cache.updateMusicChannel()
		helper.respond(new ResponseBuilder(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`))
	}
}

export default file
