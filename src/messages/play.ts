import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import MusicService from "../models/MusicService"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"
import { MessageActionRow, MessageEmbed, MessageSelectMenu, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import ConversionHelper from "../utilities/ConversionHelper"

const file: iMessageFile<iValue, Document, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}play`),
	execute: async helper => {
		const member = helper.message.member!
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}

		const query = helper.input()!.join(" ")

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
					helper.reactFailure()
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Playlist is empty"), 5000)
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
				
				helper.reactSuccess()
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
				helper.reactFailure()
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
