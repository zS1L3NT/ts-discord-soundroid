import ApiHelper from "../utilities/ApiHelper"
import ChannelCleaner from "../utilities/ChannelCleaner"
import Document, { iDocument } from "./Document"
import MusicService from "./MusicService"
import QueueBuilder from "../utilities/QueueBuilder"
import { Client, Guild, GuildMember, Message, MessageEmbed, VoiceChannel } from "discord.js"
import { useTry, useTryAsync } from "no-try"

export default class GuildCache {
	public bot: Client
	public guild: Guild
	public ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private document: Document = Document.getEmpty()

	public apiHelper: ApiHelper
	public service?: MusicService

	public constructor(
		bot: Client,
		guild: Guild,
		apiHelper: ApiHelper,
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (cache: GuildCache) => void
	) {
		this.bot = bot
		this.guild = guild
		this.apiHelper = apiHelper
		this.ref = ref
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				this.document = new Document(snap.data() as iDocument)
				resolve(this)
			}
		})
	}

	/**
	 * Method run every minute
	 */
	public async updateMinutely(debug: number) {
		console.time(`Updated Channels for Guild(${this.guild.name}) [${debug}]`)

		await this.updateMusicChannel()

		console.timeEnd(`Updated Channels for Guild(${this.guild.name}) [${debug}]`)
	}

	public async updateMusicChannel() {
		const musicChannelId = this.getMusicChannelId()
		if (!musicChannelId) return

		const [message_err, message] = await useTryAsync(async () => {
			const musicMessageId = this.getMusicMessageId()
			const cleaner = new ChannelCleaner(this, musicChannelId, [musicMessageId])
			await cleaner.clean()

			const [newMusicMessageId] = cleaner.getMessageIds()
			const message = cleaner.getMessages().get(newMusicMessageId)!
			if (newMusicMessageId !== musicMessageId) {
				this.setMusicMessageId(newMusicMessageId)
			}

			return message
		})

		if (message_err) {
			if (message_err.message === "no-channel") {
				console.warn(`Guild(${this.guild.name}) has no Channel(${musicChannelId})`)
				await this.setMusicChannelId("")
				return
			}
			throw message_err
		}

		const [page_err, page] = useTry(() => {
			const embed = message.embeds[0]
			const pageInfo = embed.fields.find(field => field.name === `Page`)!.value
			const [page_str] = pageInfo.split("/")
			return +page_str
		})

		if (this.service) {
			message.edit(await new QueueBuilder(this).build(page_err ? 1 : page))
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
		this.guild.me?.setNickname(nickname || "SounDroid Bot")
	}

	public getMusicChannelId() {
		return this.document.value.music_channel_id
	}

	public async setMusicChannelId(music_channel_id: string) {
		this.document.value.music_channel_id = music_channel_id
		await this.ref.update({ music_channel_id })
	}

	public getMusicMessageId() {
		return this.document.value.music_message_id
	}

	public async setMusicMessageId(music_message_id: string) {
		this.document.value.music_message_id = music_message_id
		await this.ref.update({ music_message_id })
	}

	public getPrefix() {
		return this.document.value.prefix
	}
}
