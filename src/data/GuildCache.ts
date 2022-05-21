import { MessageEmbed } from "discord.js"
import { useTry, useTryAsync } from "no-try"
import { BaseGuildCache, ChannelCleaner } from "nova-bot"

import logger from "../logger"
import ApiHelper from "../utils/ApiHelper"
import QueueBuilder from "../utils/QueueBuilder"
import Entry from "./Entry"
import MusicService from "./MusicService"

export default class GuildCache extends BaseGuildCache<Entry, GuildCache> {
	apiHelper!: ApiHelper
	service?: MusicService

	override resolve(resolve: (cache: GuildCache) => void) {
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				this.entry = snap.data() as Entry
				resolve(this)
			}
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
			const cleaner = new ChannelCleaner<Entry, GuildCache>(this, musicChannelId, [
				musicMessageId
			])
			await cleaner.clean()

			const [newMusicMessageId] = cleaner.getMessageIds()
			const message = cleaner.getMessages().get(newMusicMessageId!)!
			if (newMusicMessageId !== musicMessageId) {
				this.setMusicMessageId(newMusicMessageId!)
			}

			return message
		})

		if (messageErr) {
			if (messageErr.message === "no-channel") {
				logger.alert!(`Guild(${this.guild.name}) has no Channel(${musicChannelId})`)
				await this.setMusicChannelId("")
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
					new MessageEmbed()
						.setTitle(`No song currently playing`)
						.setDescription(
							"Use `/play <Youtube link, Spotify link, or Search query>` to use me!"
						)
						.setColor("GREEN")
				],
				components: []
			})
		}
	}

	setNickname(nickname?: string) {
		this.guild.me?.setNickname(nickname || "SounDroid")
	}

	async setMusicChannelId(musicChannelId: string) {
		this.entry.music_channel_id = musicChannelId
		await this.ref.update({ music_channel_id: musicChannelId })
	}

	async setMusicMessageId(musicMessageId: string) {
		this.entry.music_message_id = musicMessageId
		await this.ref.update({ music_message_id: musicMessageId })
	}
}
