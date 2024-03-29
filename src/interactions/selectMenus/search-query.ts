import { Colors, MessageType, VoiceChannel } from "discord.js"
import { BaseSelectMenu, ResponseBuilder, SelectMenuHelper } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import Song from "../../data/Song"
import logger from "../../logger"
import prisma from "../../prisma"

export default class extends BaseSelectMenu<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: SelectMenuHelper<typeof prisma, Entry, GuildCache>) {
		const channel = helper.member.voice.channel

		if (!(channel instanceof VoiceChannel)) {
			helper.update({
				embeds: [
					ResponseBuilder.bad(
						"You have to be in a voice channel to use this command",
					).build(),
				],
				components: [],
			})
		} else {
			const url = helper.value!
			if (!helper.cache.service) {
				helper.cache.service = new MusicService(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild
							.voiceAdapterCreator as DiscordGatewayAdapterCreator,
						selfDeaf: false,
					}),
					helper.cache,
				)
			}

			try {
				const song = await Song.from(helper.cache.apiHelper, url, helper.member.id)
				helper.cache.service!.enqueue(song)

				helper.cache.updateMinutely()
				helper.update({
					embeds: [
						ResponseBuilder.good(
							`Enqueued song: "${song.title} - ${song.artiste}"`,
						).build(),
					],
					components: [],
				})
				helper.cache.logger.log({
					member: helper.member,
					title: `Enqueued 1 song by search query`,
					description: `<@${helper.member.id}> enqueued [${song.title} - ${song.artiste}](${song.url})`,
					command: "play",
					color: Colors.Green,
				})
			} catch (err) {
				logger.error("Error playing song from url", err)
				helper.update({
					embeds: [ResponseBuilder.bad("Error playing song from url").build()],
					components: [],
				})
				helper.cache.logger.log({
					member: helper.member,
					title: `Error playing song from url`,
					description: (err as Error).stack || "No stack trace available",
					command: "play",
					color: Colors.Red,
				})
			}
		}

		if (helper.message.type !== MessageType.ChatInputCommand) {
			setTimeout(() => {
				helper.message.delete().catch(err => logger.warn("Failed to delete message", err))
			}, 5000)
		}
	}
}
