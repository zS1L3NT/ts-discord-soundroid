import { GuildMember, Message, VoiceChannel } from "discord.js"
import { BaseSelectMenu, ResponseBuilder, SelectMenuHelper } from "nova-bot"

import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import Song from "../../data/Song"
import logger from "../../logger"

export default class extends BaseSelectMenu<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override middleware = []

	override async execute(helper: SelectMenuHelper<Entry, GuildCache>) {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			helper.update({
				embeds: [
					ResponseBuilder.bad(
						"You have to be in a voice channel to use this command"
					).build()
				],
				components: []
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
						selfDeaf: false
					}),
					helper.cache
				)
			}

			try {
				const song = await Song.from(helper.cache.apiHelper, url, member.id)
				helper.cache.service!.enqueue(song)

				helper.cache.updateMinutely()
				helper.update({
					embeds: [
						ResponseBuilder.good(
							`Enqueued song: "${song.title} - ${song.artiste}"`
						).build()
					],
					components: []
				})
				helper.cache.logger.log({
					member,
					title: `Enqueued 1 song by search query`,
					description: `<@${member.id}> enqueued [${song.title} - ${song.artiste}](${song.url})`,
					command: "play",
					color: "GREEN"
				})
			} catch (err) {
				logger.error("Error playing song from url", err)
				helper.update({
					embeds: [ResponseBuilder.bad("Error playing song from url").build()],
					components: []
				})
				helper.cache.logger.log({
					member,
					title: `Error playing song from url`,
					description: (err as Error).stack || "No stack trace available",
					command: "play",
					color: "RED"
				})
			}
		}

		if (helper.interaction.message.type === "DEFAULT") {
			setTimeout(() => {
				const message = helper.interaction.message as Message
				message.delete().catch(err => logger.warn("Failed to delete message", err))
			}, 5000)
		}
	}
}
