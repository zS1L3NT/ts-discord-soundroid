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
import EmbedResponse, { Emoji } from "./EmbedResponse"
import InteractionHelper from "./InteractionHelper"
import MessageHelper from "./MessageHelper"

export default class PlayRequest<Helper extends MessageHelper | InteractionHelper> {
	private helper: Helper
	private query: string

	public constructor(helper: Helper, query: string) {
		this.helper = helper
		this.query = query
	}

	public async run() {
		const member = this.getMember()
		const channel = member.voice.channel as VoiceChannel

		try {
			const URI = new URL(this.query)
			await this.handleURI(channel, member, URI)
		} catch {
			await this.handleQuery(member)
		}
	}

	private async handleURI(channel: VoiceChannel, member: GuildMember, URI: URL) {
		if (!this.helper.cache.service) {
			this.helper.cache.service = new MusicService(
				joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guild.id,
					adapterCreator: channel.guild
						.voiceAdapterCreator as DiscordGatewayAdapterCreator,
					selfDeaf: false
				}),
				this.helper.cache
			)
		}

		const playlistMatch = URI.pathname.match(/^\/playlist\/(.*)$/)
		if (playlistMatch) {
			const [, playlistId] = playlistMatch
			await this.handleSpotifyPlaylist(member, playlistId)
		} else {
			await this.handleSong(member)
		}
	}

	private async handleQuery(member: GuildMember) {
		const results = await this.helper.cache.apiHelper.searchYoutubeSongs(
			this.query,
			member.id
		)
		const emojis: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

		this.reactSuccess()
		this.helper.respond(
			{
				embeds: [
					new MessageEmbed()
						.setAuthor(
							`YouTube search results for: "${this.query}"`,
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
			},
			60_000
		)
	}

	private async handleSpotifyPlaylist(member: GuildMember, playlistId: string) {
		try {
			const songs = await this.helper.cache.apiHelper.findSpotifyPlaylist(
				playlistId,
				member.id
			)
			if (songs.length > 0) {
				this.helper.cache.service!.enqueue(songs.shift()!)
				this.helper.cache.service!.queue.push(...songs)
				this.helper.cache.updateMusicChannel()
				this.reactSuccess()
				this.helper.respond(
					new EmbedResponse(Emoji.GOOD, `Enqueued ${songs.length + 1} songs`),
					5000
				)
			} else {
				this.reactFailure()
				this.helper.respond(new EmbedResponse(Emoji.BAD, "Playlist is empty"), 5000)
			}
		} catch (err) {
			console.error(err)
			this.reactFailure()
			this.helper.respond(
				new EmbedResponse(Emoji.BAD, "Error playing playlist from url"),
				5000
			)
		}
	}

	private async handleSong(member: GuildMember) {
		try {
			const song = await Song.from(this.helper.cache.apiHelper, this.query, member.id)
			this.helper.cache.service!.enqueue(song)
			this.helper.cache.updateMusicChannel()
			this.reactSuccess()
			this.helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Enqueued: "${song.title} - ${song.artiste}"`
				),
				5000
			)
		} catch (err) {
			console.error(err)
			this.reactFailure()
			this.helper.respond(
				new EmbedResponse(Emoji.BAD, "Error playing song from url"),
				5000
			)
		}
	}

	private getMember(): GuildMember {
		if (this.helper instanceof MessageHelper) {
			return this.helper.message.member as GuildMember
		}

		if (this.helper instanceof InteractionHelper) {
			return this.helper.interaction.member as GuildMember
		}

		throw new Error()
	}

	private reactSuccess() {
		if (this.helper instanceof MessageHelper) this.helper.reactSuccess()
	}

	private reactFailure() {
		if (this.helper instanceof MessageHelper) this.helper.reactFailure()
	}
}
