import GuildCache from "../models/GuildCache"
import {
	GuildMember,
	Interaction,
	InteractionReplyOptions,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from "discord.js"
import DurationHelper from "./DurationHelper"
import Song from "../models/Song"
import DominantColorGetter from "./DominantColorGetter"
import { Emoji } from "./BotSetupHelper"

export default class QueueFormatter {
	private cache: GuildCache
	private interaction: Interaction

	public constructor(cache: GuildCache, interaction: Interaction) {
		this.cache = cache
		this.interaction = interaction
	}

	public async getMessagePayload(page: number = 1): Promise<InteractionReplyOptions> {
		const member = this.interaction.member as GuildMember

		if (this.cache.service) {
			const embed = new MessageEmbed()
			const page_offset = (page - 1) * 10
			const queue = this.cache.service.queue.slice(1).slice(page_offset, page_offset + 10)

			embed.setTitle(`Queue for ${this.interaction.guild!.name}`)

			const song = this.cache.service.queue[0]
			embed.addField(`\u200B`, `__Now Playing:__`)

			if (song) {
				embed.addField(...this.song_format(song))
				embed.setThumbnail(song.cover)
				embed.setColor(await new DominantColorGetter(song.cover).getColor())
			}
			else {
				embed.addField(`Not playing anything at the moment`, `\u200B`)
			}

			if (queue.length > 0) {
				embed.addField(`\u200B`, `__Queue:__`)
				queue.forEach((song, i) => {
					const song_index = `\`${page_offset + i + 1}.\` `
					const field_format = this.song_format(song)
					embed.addField(song_index + field_format[0], field_format[1])
				})
			}

			const playing_duration = this.cache.service.queue.slice(1).map(song => song.duration).reduce((t, d) => t + d, 0)
			const max_pages = Math.ceil((this.cache.service.queue.length - 1) / 10) || 1

			embed.addField(`\u200B`, `**${this.cache.service.queue.length - 1} songs in queue | ${new DurationHelper(playing_duration).format()} total length**`)
			embed.addField(`Page`, `${page}/${max_pages}`, true)
			embed.addField(`Loop`, this.cache.service.loop ? "✅" : "❌", true)
			embed.addField(`Queue Loop`, this.cache.service.queue_loop ? "✅" : "❌", true)
			embed.setFooter(`Requested by @${member.displayName}`, this.interaction.user.displayAvatarURL())

			return {
				embeds: [embed],
				components: [
					new MessageActionRow()
						.addComponents([
							new MessageButton()
								.setCustomId("queue-previous-page")
								.setStyle("PRIMARY")
								.setLabel("Previous page")
								.setDisabled(page === 1)
						])
						.addComponents([
							new MessageButton()
								.setCustomId("queue-next-page")
								.setStyle("PRIMARY")
								.setLabel("Next page")
								.setDisabled(page === max_pages)
						])
				]
			}
		}
		else {
			return {
				embeds: [
					new MessageEmbed()
						.setAuthor("I am not currently in a voice channel", Emoji.BAD)
						.setColor("#DD2E44")
				]
			}
		}
	}

	public song_format(song: Song): [string, string] {
		return [
			`${song.title} - ${song.artiste} | ${new DurationHelper(song.duration).format()}`,
			`Requested by <@!${song.requester}> | [Open song](${song.url})`
		]
	}
}