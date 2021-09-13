import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, MessageActionRow, MessageSelectMenu, VoiceChannel } from "discord.js"
import MusicService from "../models/MusicService"
import { joinVoiceChannel } from "@discordjs/voice"
import Song from "../models/Song"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song from a url or search")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("Search query")
				.setRequired(true)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel =  member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		const query = helper.string("query", true)!

		try {
			const urlObject = new URL(query)

			if (!helper.cache.service) {
				helper.cache.service = new MusicService(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator
					}),
					helper.cache.apiHelper,
					() => delete helper.cache.service
				)
			}

			const playlistMatch = urlObject.pathname.match(/^\/playlist\/(.*)$/)
			if (playlistMatch) {
				try {
					const [, playlistId] = playlistMatch
					const songs = await helper.cache.apiHelper.findSpotifyPlaylist(playlistId, member.id)
					if (songs.length > 0) {
						helper.cache.service!.enqueue(songs.shift()!)
						helper.cache.service!.queue.push(...songs)
						helper.respond(`✅ Enqueued ${songs.length + 1} songs`)
					} else {
						helper.respond("❌ Playlist is empty")
					}
				} catch (err) {
					console.error(err)
					helper.respond("❌ Error playing playlist from url")
				}
			}
			else {
				try {
					const song = await Song.from(helper.cache.apiHelper, query, member.id)
					helper.cache.service!.enqueue(song)
					helper.respond(`✅ Enqueued: \`${song.title} - ${song.artiste}\``)
				} catch (err) {
					console.error(err)
					helper.respond("❌ Error playing song from url")
				}
			}
		} catch {
			const results = await helper.cache.apiHelper.searchYoutubeSongs(query, member.id)
			const emojis: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

			helper.respond({
				content: `📃 Search results for: \`${query}\``,
				components: [
					new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId("search-query")
								.addOptions(results.map((result, i) => ({
									emoji: emojis[i],
									label: result.title,
									value: result.url,
									description: result.artiste
								})))
						)
				]
			})
		}
	}
} as iInteractionFile