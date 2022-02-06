import DominantColorGetter from "./DominantColorGetter"
import DurationHelper from "./DurationHelper"
import GuildCache from "../data/GuildCache"
import Song from "../data/Song"
import { Emoji } from "nova-bot"
import {
	GuildMember,
	InteractionReplyOptions,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from "discord.js"

export default class QueueBuilder {
	private cache: GuildCache
	private member?: GuildMember

	public constructor(cache: GuildCache, member?: GuildMember) {
		this.cache = cache
		this.member = member
	}

	public async build(page: number = 1): Promise<InteractionReplyOptions> {
		if (this.cache.service) {
			const embed = new MessageEmbed()
			const playing_duration = this.cache.service.queue
				.slice(1)
				.map(song => song.duration)
				.reduce((t, d) => t + d, 0)
			const max_pages = Math.ceil((this.cache.service.queue.length - 1) / 10) || 1

			if (page > max_pages) {
				page = max_pages
			}

			const page_offset = (page - 1) * 10
			const queue = this.cache.service.queue.slice(1).slice(page_offset, page_offset + 10)

			embed.setTitle(`Queue for ${this.cache.guild.name}`)

			const song = this.cache.service.queue[0]
			embed.addField(`\u200B`, `__Now Playing:__`)

			if (song) {
				embed.addField(...this.songFormat(song))
				embed.setThumbnail(song.cover)
				try {
					embed.setColor(await new DominantColorGetter(song.cover).getColor())
				} catch {}
			} else {
				embed.addField(`Not playing anything at the moment`, `\u200B`)
			}

			if (this.cache.service) {
				if (queue.length > 0) {
					embed.addField(`\u200B`, `__Queue:__`)
					queue.forEach((song, i) => {
						const song_index = `\`${page_offset + i + 1}.\` `
						const field_format = this.songFormat(song)
						embed.addField(song_index + field_format[0], field_format[1])
					})
					embed.addField(
						`\u200B`,
						`**${
							this.cache.service.queue.length - 1
						} songs in queue | ${new DurationHelper(
							playing_duration
						).format()} total length**`
					)
				}

				embed.addField(`Page`, `${page}/${max_pages}`, true)
				embed.addField(`Loop`, this.cache.service.loop ? "✅" : "❌", true)
				embed.addField(`Queue Loop`, this.cache.service.queue_loop ? "✅" : "❌", true)
				if (this.member) {
					embed.setFooter({
						text: `Requested by @${this.member.displayName}`,
						iconURL: this.member.user.displayAvatarURL()
					})
				}

				return {
					embeds: [embed],
					components: [
						new MessageActionRow().addComponents([
							new MessageButton()
								.setCustomId("queue-page-select")
								.setStyle("PRIMARY")
								.setLabel("Choose page")
								.setDisabled(max_pages === 1),
							new MessageButton()
								.setCustomId("refresh")
								.setStyle("SUCCESS")
								.setLabel("Refresh queue")
						])
					]
				}
			}
		}

		return {
			embeds: [
				new MessageEmbed()
					.setAuthor({
						name: "I am not currently in a voice channel",
						iconURL: Emoji.BAD
					})
					.setColor("#DD2E44")
			],
			components: []
		}
	}

	public songFormat(song: Song): [string, string] {
		return [
			`${song.title} - ${song.artiste} | ${new DurationHelper(song.duration).format()}`,
			`Requested by <@!${song.requester}> | [Open song](${song.url})`
		]
	}
}
