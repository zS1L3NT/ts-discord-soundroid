import { BaseGuildCache, ChannelCleaner } from "@framework"
import { Colors, EmbedBuilder } from "discord.js"

import QueueBuilder from "../builders/queue-builder"
import { tryasync, trysync } from "../framework/utils/try-catch"
import logger from "../logger"
import { servers } from "../schema"
import type ApiHelper from "../utils/api-helper"
import type MusicService from "./music-service"

export default class GuildCache extends BaseGuildCache {
	apiHelper!: ApiHelper
	service?: MusicService

	override async refresh(): Promise<void> {
		let server = await this.db.query.servers.findFirst({
			where: (servers, { eq }) => eq(servers.guild_id, this.guild.id),
		})

		if (!server) {
			await this.db.insert(servers).values({
				guild_id: this.guild.id,
				prefix: null,
				log_channel_id: null,
				music_channel_id: null,
				music_message_id: null,
			})

			server = await this.db.query.servers.findFirst({
				where: (servers, { eq }) => eq(servers.guild_id, this.guild.id),
			})
		}

		if (!server) {
			throw new Error("Could not find record in database, nor create a record in database")
		}

		this.server = server
		this.aliases = await this.db.query.aliases.findMany({
			where: (aliases, { eq }) => eq(aliases.guild_id, this.guild.id),
		})
	}

	/**
	 * Method run every minute
	 */
	override async updateMinutely() {
		const musicChannelId = this.server.music_channel_id
		if (!musicChannelId) return

		const [message, merror] = await tryasync(async () => {
			const musicMessageId = this.server.music_message_id
			const cleaner = new ChannelCleaner(this, musicChannelId, [musicMessageId ?? ""])
			await cleaner.clean()

			const [newMusicMessageId] = cleaner.getMessageIds()
			const message = cleaner.getMessages().get(newMusicMessageId!)!
			if (newMusicMessageId !== musicMessageId) {
				await this.update({ music_message_id: newMusicMessageId! })
			}

			return message
		})

		if (merror) {
			if (merror.message === "no-channel") {
				logger.alert!(`Guild(${this.guild.name}) has no Channel(${musicChannelId})`)
				await this.update({ music_channel_id: null })
				return
			}
			if (merror.name === "HTTPError") {
				logger.warn("Failed to clean channel:", merror)
				return
			}
			throw merror
		}

		const [page, perror] = trysync(() => {
			const embed = message.embeds[0]!
			const pageInfo = embed.fields.find(field => field.name === "Page")!.value
			return +pageInfo.split("/")[0]!
		})

		if (this.service) {
			message.edit(await new QueueBuilder(this).build(perror ? 1 : page))
		} else {
			this.setNickname()
			message.edit({
				embeds: [
					new EmbedBuilder()
						.setTitle("No song currently playing")
						.setDescription(
							"Use `/play <Youtube link, Spotify link, or Search query>` to use me!",
						)
						.setColor(Colors.Green),
				],
				components: [],
			})
		}
	}

	override getEmptyServer(): Server {
		return {
			guild_id: "",
			prefix: null,
			log_channel_id: null,
			music_channel_id: null,
			music_message_id: null,
		}
	}

	setNickname(nickname?: string) {
		this.guild.members.me!.setNickname(nickname || "SounDroid")
	}
}
