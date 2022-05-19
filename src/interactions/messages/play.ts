import { VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import { iMessageFile, ResponseBuilder } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import ConversionHelper from "../../utilities/ConversionHelper"
import SearchSelectBuilder from "../../utilities/SearchSelectBuilder"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "play", "more"),
	execute: async helper => {
		const member = helper.message.member!
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				ResponseBuilder.bad("You have to be in a voice channel to use this command"),
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
					return helper.respond(ResponseBuilder.bad("Playlist is empty"), 5000)
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
						ResponseBuilder.good(`Enqueued: "${first.title} - ${first.artiste}"`),
						5000
					)
				} else {
					helper.respond(ResponseBuilder.good(`Enqueued ${songs.length + 1} songs`), 5000)
				}
			})

			if (err) {
				helper.respond(ResponseBuilder.bad(err.message), 5000)
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
