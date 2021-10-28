import { SlashCommandBuilder } from "@discordjs/builders"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import {
	GuildMember,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	VoiceChannel
} from "discord.js"
import MusicService from "../models/MusicService"
import Song from "../models/Song"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song from a url or search")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription(
					"Can be a YouTube link, Spotify Song/Playlist link or a youtube search query"
				)
				.setRequired(true)
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

		const query = helper.string("query")!

		try {
			const urlObject = new URL(query)

			if (!helper.cache.service) {
				helper.cache.service = new MusicService(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
					}),
					helper.cache
				)
			}

			const playlistMatch = urlObject.pathname.match(/^\/playlist\/(.*)$/)
			if (playlistMatch) {
				try {
					const [, playlistId] = playlistMatch
					const songs = await helper.cache.apiHelper.findSpotifyPlaylist(
						playlistId,
						member.id
					)
					if (songs.length > 0) {
						helper.cache.service!.enqueue(songs.shift()!)
						helper.cache.service!.queue.push(...songs)
						helper.cache.updateMusicChannel()
						helper.respond(
							new EmbedResponse(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`)
						)
					} else {
						helper.respond(new EmbedResponse(Emoji.BAD, "Playlist is empty"))
					}
				} catch (err) {
					console.error(err)
					helper.respond(new EmbedResponse(Emoji.BAD, "Error playing playlist from url"))
				}
			} else {
				try {
					const song = await Song.from(helper.cache.apiHelper, query, member.id)
					helper.cache.service!.enqueue(song)
					helper.cache.updateMusicChannel()
					helper.respond(
						new EmbedResponse(Emoji.GOOD, `Enqueued: "${song.title} - ${song.artiste}"`)
					)
				} catch (err) {
					console.error(err)
					helper.respond(new EmbedResponse(Emoji.BAD, "Error playing song from url"))
				}
			}
		} catch {
			const results = await helper.cache.apiHelper.searchYoutubeSongs(query, member.id)
			const emojis: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

			helper.respond({
				embeds: [
					new MessageEmbed()
						.setAuthor(
							`YouTube search results for: "${query}"`,
							`https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`
						)
						.setColor("#FF0000")
				],
				components: [
					new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId("search-query").addOptions(
							results.map((result, i) => ({
								emoji: emojis[i],
								label: result.title,
								value: result.url,
								description: result.artiste
							}))
						)
					)
				]
			})
		}
	}
} as iInteractionFile
