import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import { GuildMember, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(helper.cache.getMessageCommandRegex("play-range")),
	execute: async helper => {
		const member = helper.message.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
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

		const input = helper.input()!
		if (!input.length) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					[
						"The command .play-range takes 3 parameters",
						"1) A Spotify playlist link (required)",
						"2) A start position (optional, first song of the playlist by default)",
						"3) An end position (optional, last song of the playlist by default)"
					].join("\n")
				),
				15_000
			)
		}

		const [link, fromStr, toStr] = input

		const from = helper.getNumber(fromStr, 1, 0)
		if (from < 1) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, `Invalid "from" position: ${fromStr}`),
				5000
			)
		}

		let to = helper.getNumber(toStr, null, 0)
		if (to && to < 1) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, `Invalid "to" position: ${toStr}`),
				5000
			)
		}

		const [err, playlistId] = useTry(() => {
			const url = new URL(link!)
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
				new ResponseBuilder(Emoji.BAD, "Link must be a Spotify/Youtube playlist link!"),
				5000
			)
		}

		if (to) {
			if (from > to) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`Invalid "from" and "to" positions: ${from} and ${to}`
					),
					5000
				)
			}

			if (to - from > 1000) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`Cannot add more than 1000 songs, bot will take too long to respond`
					),
					5000
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
				new ResponseBuilder(
					Emoji.BAD,
					`Invalid "to" position: Playlist only has ${length} songs`
				),
				5000
			)
		}

		if (!to) {
			to = length
		}

		helper.respond(
			new ResponseBuilder(Emoji.GOOD, `Adding songs from #${from} to #${to}...`),
			5000
		)

		const [, spotifyPlaylistSongs] = await useTryAsync(() =>
			helper.cache.apiHelper.findSpotifyPlaylist(playlistId, from, to!, member.id)
		)
		const [, youtubePlaylistSongs] = await useTryAsync(() =>
			helper.cache.apiHelper.findYoutubePlaylist(playlistId, from, to!, member.id)
		)
		const songs = spotifyPlaylistSongs || youtubePlaylistSongs

		helper.cache.service!.enqueue(songs.shift()!)
		helper.cache.service!.queue.push(...songs)
		helper.cache.updateMusicChannel()
		setTimeout(() => {
			helper.update(
				new ResponseBuilder(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`),
				5000
			)
		}, 1000)
	}
}

export default file
