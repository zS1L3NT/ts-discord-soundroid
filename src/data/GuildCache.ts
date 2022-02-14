import ApiHelper from "../utilities/ApiHelper"
import Entry from "./Entry"
import MusicService from "./MusicService"
import QueueBuilder from "../utilities/QueueBuilder"
import { BaseGuildCache, ChannelCleaner } from "nova-bot"
import { GuildMember, MessageEmbed, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"

export default class GuildCache extends BaseGuildCache<Entry, GuildCache> {
	public apiHelper!: ApiHelper
	public service?: MusicService

	public onConstruct(): void {}

	public resolve(resolve: (cache: GuildCache) => void): void {
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
	public async updateMinutely(_: number) {
		await this.updateMusicChannel()
	}

	public async updateMusicChannel() {
		const musicChannelId = this.getMusicChannelId()
		if (!musicChannelId) return

		const [messageErr, message] = await useTryAsync(async () => {
			const musicMessageId = this.getMusicMessageId()
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
			message.edit({
				embeds: [
					new MessageEmbed()
						.setTitle(`No song currently playing`)
						.setDescription(
							"Use `/play <Youtube link, Spotify link, or Search query>` to use me!"
						)
						.setColor("#77B255")
				],
				components: []
			})
		}
	}

	public isMemberInMyVoiceChannel(member: GuildMember): boolean {
		return (
			member.voice.channel instanceof VoiceChannel &&
			member.voice.channel.id === this.guild.me?.voice?.channel?.id
		)
	}

	public setNickname(nickname?: string) {
		this.guild.me?.setNickname(nickname || "SounDroid")
	}

	public getMusicChannelId() {
		return this.entry.music_channel_id
	}

	public async setMusicChannelId(musicChannelId: string) {
		this.entry.music_channel_id = musicChannelId
		await this.ref.update({ music_channel_id: musicChannelId })
	}

	public getMusicMessageId() {
		return this.entry.music_message_id
	}

	public async setMusicMessageId(musicMessageId: string) {
		this.entry.music_message_id = musicMessageId
		await this.ref.update({ music_message_id: musicMessageId })
	}

	public getPrefix() {
		return this.entry.prefix
	}
}
