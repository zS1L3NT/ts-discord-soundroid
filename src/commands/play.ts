import ConversionHelper from "../utilities/ConversionHelper"
import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import MusicService from "../models/MusicService"
import SearchSelectBuilder from "../utilities/SearchSelectBuilder"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "play",
		description: {
			slash: "Play Song/Playlist from YouTube/Spotify",
			help: [
				"Play a song with either",
				"(1) YouTube Video Link",
				"(2) YouTube Playlist Link",
				"(3) Spotify Song Link",
				"(4) Spotify Playlist Link",
				"(5) YouTube Music Search Query",
				"(6) YouTube Video Search Query"
			].join("\n")
		},
		options: [
			{
				name: "query",
				description: {
					slash: "Can be a YouTube/Spotify Song/Playlist or Search Query",
					help: "Can be a YouTube/Spotify Song/Playlist or Search Query"
				},
				type: "string",
				requirements: "Text or URL",
				required: true
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

		const query = helper.string("query")!

		const [, url] = useTry(() => new URL(query))
		if (url) {
			const [err] = await useTryAsync(async () => {
				const songs = await new ConversionHelper(
					helper.cache.apiHelper,
					url,
					member.id
				).getSongs()
				const [first] = songs

				if (!first) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Playlist is empty"))
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
				const service = helper.cache.service

				service.enqueue(first)
				service.queue.push(...songs.slice(1))
				helper.cache.updateMusicChannel()

				if (songs.length === 1) {
					helper.respond(
						new ResponseBuilder(
							Emoji.GOOD,
							`Enqueued: "${first.title} - ${first.artiste}"`
						)
					)
				} else {
					helper.respond(
						new ResponseBuilder(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`)
					)
				}
			})

			if (err) {
				helper.respond(new ResponseBuilder(Emoji.BAD, err.message))
			}
		} else {
			helper.respond(
				await new SearchSelectBuilder(helper.cache.apiHelper, query, member.id).buildMusic()
			)
		}
	}
}

export default file
