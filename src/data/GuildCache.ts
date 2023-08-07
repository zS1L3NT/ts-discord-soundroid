import { Colors, EmbedBuilder } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import { BaseGuildCache, ChannelCleaner } from "nova-bot"

import { Entry } from "@prisma/client"

import logger from "../logger"
import prisma from "../prisma"
import ApiHelper from "../utils/ApiHelper"
import QueueBuilder from "../utils/QueueBuilder"
import MusicService from "./MusicService"

export default class GuildCache extends BaseGuildCache<typeof prisma, Entry, GuildCache> {
	apiHelper!: ApiHelper
	service?: MusicService

	override async refresh(): Promise<void> {
		this.entry = await this.prisma.entry.findFirstOrThrow({
			where: {
				guild_id: this.guild.id,
			},
		})
		this.aliases = await this.prisma.alias.findMany({
			where: {
				guild_id: this.guild.id,
			},
		})
	}

	/**
	 * Method run every minute
	 */
	override async updateMinutely() {
		const musicChannelId = this.entry.music_channel_id
		if (!musicChannelId) return

		const [messageErr, message] = await useTryAsync(async () => {
			const musicMessageId = this.entry.music_message_id
			const cleaner = new ChannelCleaner(this, musicChannelId, [musicMessageId ?? ""])
			await cleaner.clean()

			const [newMusicMessageId] = cleaner.getMessageIds()
			const message = cleaner.getMessages().get(newMusicMessageId!)!
			if (newMusicMessageId !== musicMessageId) {
				await this.update({ music_message_id: newMusicMessageId! })
			}

			return message
		})

		if (messageErr) {
			if (messageErr.message === "no-channel") {
				logger.alert!(`Guild(${this.guild.name}) has no Channel(${musicChannelId})`)
				await this.update({ music_channel_id: null })
				return
			}
			if (messageErr.name === "HTTPError") {
				logger.warn(`Failed to clean channel:`, messageErr)
				return
			}
			throw messageErr
		}

		const [pageErr, page] = useTry(() => {
			const embed = message.embeds[0]!
			const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
			return +pageInfo.split("/")[0]!
		})

		if (this.service) {
			message.edit(await new QueueBuilder(this).build(pageErr ? 1 : page))
		} else {
			this.setNickname()
			message.edit({
				embeds: [
					new EmbedBuilder()
						.setTitle(`No song currently playing`)
						.setDescription(
							"Use `/play <Youtube link, Spotify link, or Search query>` to use me!",
						)
						.setColor(Colors.Green),
				],
				components: [],
			})
		}
	}

	override getEmptyEntry(): Entry {
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
