import MusicService from "../models/MusicService"
import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { GuildMember, VoiceChannel } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { useTry } from "no-try"

const file: iInteractionFile = {
	defer: true,
	help: {
		description:
			"Plays a Spotify playlist, except you can specify which song you want to start playing from",
		params: [
			{
				name: "link",
				description: "Spotify playlist link",
				requirements: "URL",
				required: true
			},
			{
				name: "from",
				description: "The first position of the playlist to play from",
				requirements: "Number that references a song in the Spotify playlist",
				required: false,
				default: "1"
			},
			{
				name: "to",
				description: "The last position of the playlist to play from",
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
				.setDescription(
					"The first song in the playlist to add to queue. Leave empty for first song"
				)
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("to")
				.setDescription(
					"The last song in the playlist to add to queue. Leave empty for last song"
				)
				.setRequired(false)
		),
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
			const linkURI = new URL(link)
			const linkMatch = linkURI.pathname.match(/^\/playlist\/(.*)$/)
			if (!linkMatch || linkURI.host !== "open.spotify.com") {
				throw new Error()
			}

			return linkMatch[1]
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

		const length = await helper.cache.apiHelper.findSpotifyPlaylistLength(playlistId)
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

		const songs = await helper.cache.apiHelper.findSpotifyPlaylist(
			playlistId,
			from,
			to,
			member.id
		)

		helper.cache.service!.enqueue(songs.shift()!)
		helper.cache.service!.queue.push(...songs)
		helper.cache.updateMusicChannel()
		helper.respond(new ResponseBuilder(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`))
	}
}

module.exports = file
