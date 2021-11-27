import { SlashCommandBuilder } from "@discordjs/builders"
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice"
import { GuildMember, VoiceChannel } from "discord.js"
import { useTry } from "no-try"
import MusicService from "../models/MusicService"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

const file: iInteractionFile = {
	builder: new SlashCommandBuilder()
		.setName("play-range")
		.setDescription("Play a Spotify playlist from a specific range")
		.addStringOption(option =>
			option
				.setName("link")
				.setDescription("Must be a Spotify Playlist link")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("from")
				.setDescription("The first song in the playlist to add to queue. Leave empty for first song")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("to")
				.setDescription("The last song in the playlist to add to queue. Leave empty for last song")
				.setRequired(false)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
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
			const linkURI = new URL(link)
			const linkMatch = linkURI.pathname.match(/^\/playlist\/(.*)$/)
			if (!linkMatch || linkURI.host !== "open.spotify.com") {
				throw new Error()
			}

			return linkMatch[1]
		})

		if (err) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Link must me a Spotify playlist link")
			)
		}

		let from = helper.integer("from") || 1
		let to = helper.integer("to")

		if (from < 1) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, `Invalid "from" position: ${from}`)
			)
		}

		if (to) {
			if (from > to) {
				return helper.respond(
					new EmbedResponse(
						Emoji.BAD,
						`Invalid "from" and "to" positions: ${from} and ${to}`
					)
				)
			}

			if (to - from > 1000) {
				return helper.respond(
					new EmbedResponse(
						Emoji.BAD,
						`Cannot add more than 1000 songs, bot will take too long to respond`
					)
				)
			}
		}

		const length = await helper.cache.apiHelper.findSpotifyPlaylistLength(playlistId)
		if (to && to > length) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					`Invalid "to" position: Playlist only has ${length} songs`
				)
			)
		}

		if (!to) {
			to = length
		}

		helper.respond(
			new EmbedResponse(
				Emoji.GOOD,
				`Adding songs from #${from} to #${to}...`
			)
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
		helper.respond(new EmbedResponse(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`))
	}
}

module.exports = file
