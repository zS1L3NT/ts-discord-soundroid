import { joinVoiceChannel } from "@discordjs/voice"
import { MessageActionRow, MessageEmbed, MessageSelectMenu, VoiceChannel } from "discord.js"
import MusicService from "../models/MusicService"
import Song from "../models/Song"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play`),
	execute: async helper => {
		const member = helper.message.member!
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}

		const matches = helper.match("\\.play *(.*)")!
		const query = matches[0]

		try {
			const urlObject = new URL(query)

			if (!helper.cache.service) {
				helper.cache.service = new MusicService(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator
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
						helper.reactSuccess()
						helper.respond(
							new EmbedResponse(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`),
							5000
						)
					} else {
						helper.reactFailure()
						helper.respond(new EmbedResponse(Emoji.BAD, "Playlist is empty"), 5000)
					}
				} catch (err) {
					console.error(err)
					helper.reactFailure()
					helper.respond(
						new EmbedResponse(Emoji.BAD, "Error playing playlist from url"),
						5000
					)
				}
			} else {
				try {
					const song = await Song.from(helper.cache.apiHelper, query, member.id)
					helper.cache.service!.enqueue(song)
					helper.cache.updateMusicChannel()
					helper.reactSuccess()
					helper.respond(
						new EmbedResponse(
							Emoji.GOOD,
							`Enqueued: "${song.title} - ${song.artiste}"`
						),
						5000
					)
				} catch (err) {
					console.error(err)
					helper.reactFailure()
					helper.respond(
						new EmbedResponse(Emoji.BAD, "Error playing song from url"),
						5000
					)
				}
			}
		} catch {
			const results = await helper.cache.apiHelper.searchYoutubeSongs(query, member.id)
			const emojis: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

			helper.reactSuccess()
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
			}, 60_000)
		}
	}
} as iMessageFile
