import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import MusicService from "../models/MusicService"
import Song from "../models/Song"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iInteractionFile, ResponseBuilder } from "discordjs-nova"
import {
	GuildMember,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	VoiceChannel
} from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"
import { useTry, useTryAsync } from "no-try"
import ConversionHelper from "../utilities/ConversionHelper"

const file: iInteractionFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Play a song with either",
			"(1) YouTube Video Link",
			"(2) YouTube Playlist Link",
			"(3) Spotify Song Link",
			"(4) Spotify Playlist Link",
			"(5) YouTube Music Search Query"
		].join("\n"),
		params: [
			{
				name: "query",
				description: "Can be either of the 5 options specified above",
				requirements: "Text or URL",
				required: true
			}
		]
	},
	builder: new SlashCommandBuilder()
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
}

export default file
