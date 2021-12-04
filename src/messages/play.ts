import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import MusicService from "../models/MusicService"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"
import { MessageActionRow, MessageEmbed, MessageSelectMenu, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import ConversionHelper from "../utilities/ConversionHelper"
import SearchSelectBuilder from "../utilities/SearchSelectBuilder"

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
			helper.reactSuccess()
			helper.respond(
				await new SearchSelectBuilder(helper.cache.apiHelper, query, member.id).buildMusic()
			)
		}
	}
}

export default file
