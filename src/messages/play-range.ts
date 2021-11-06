import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice"
import { GuildMember, VoiceChannel } from "discord.js"
import { useTry } from "no-try"
import MusicService from "../models/MusicService"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play-range`),
	execute: async helper => {
		const member = helper.message.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
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
				new EmbedResponse(
					Emoji.BAD,
					[
						"The command .play-range takes 3 parameters",
						"1) A Spotify playlist link (required)",
						"2) A start position (optional, first song of the playlist by default)",
						"3) An end position (optional, last song of the playlist by default)"
					].join("\n")
				),
				10_000
			)
		}

		const [link, from_str, to_str] = input

		const from = helper.getNumber(from_str, 1, 0)
		if (from < 1) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, `Invalid "from" position: ${from_str}`),
				5000
			)
		}

		let to = helper.getNumber(to_str, null, 0)
		if (to && to < 1) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, `Invalid "to" position: ${to_str}`),
				5000
			)
		}

		const [err, playlistId] = useTry(() => {
			const linkURI = new URL(link)
			const linkMatch = linkURI.pathname.match(/^\/playlist\/(.*)$/)
			if (!linkMatch || linkURI.host !== "open.spotify.com") {
				throw new Error()
			}

			return linkMatch[1]
		})

		if (err) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Link must me a Spotify playlist link"),
				5000
			)
		}

		if (to) {
			if (from > to) {
				return helper.respond(
					new EmbedResponse(
						Emoji.BAD,
						`Invalid "from" and "to" positions: ${from} and ${to}`
					),
					5000
				)
			}

			if (to - from > 1000) {
				return helper.respond(
					new EmbedResponse(
						Emoji.BAD,
						`Cannot add more than 1000 songs, bot will take too long to respond`
					),
					5000
				)
			}
		}

		const length = await helper.cache.apiHelper.findSpotifyPlaylistLength(playlistId)
		if (to && to > length) {
			return helper.respond(
				new EmbedResponse(
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
			new EmbedResponse(Emoji.GOOD, `Adding songs from #${from} to #${to}...`),
			5000
		)

		const songs = await helper.cache.apiHelper.findSpotifyPlaylist(
			playlistId,
			from,
			to,
			member.id
		)

		helper.cache.service!.enqueue(songs.shift()!)
		helper.cache.service!.queue.push(...songs)
		helper.cache.updateMusicChannel()
		helper.respond(new EmbedResponse(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`), 5000)
	}
} as iMessageFile
