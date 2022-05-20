import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandPayload } from "nova-bot"

import GuildCache from "../data/GuildCache"
import Song from "../data/Song"
import DominantColorGetter from "./DominantColorGetter"
import DurationHelper from "./DurationHelper"

export default class QueueBuilder {
	constructor(private cache: GuildCache, private member?: GuildMember) {}

	async build(page: number = 1): Promise<CommandPayload> {
		if (this.cache.service) {
			const embed = new MessageEmbed()
			const playingDuration = this.cache.service.queue
				.slice(1)
				.map(song => song.duration)
				.reduce((t, d) => t + d, 0)
			const maxPages = Math.ceil((this.cache.service.queue.length - 1) / 10) || 1

			if (page > maxPages) {
				page = maxPages
			}

			const pageOffset = (page - 1) * 10
			const queue = this.cache.service.queue.slice(1).slice(pageOffset, pageOffset + 10)

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
						const songIndex = `\`${pageOffset + i + 1}.\` `
						const fieldFormat = this.songFormat(song)
						embed.addField(songIndex + fieldFormat[0], fieldFormat[1])
					})
					embed.addField(
						`\u200B`,
						`**${
							this.cache.service.queue.length - 1
						} songs in queue | ${new DurationHelper(
							playingDuration
						).format()} total length**`
					)
				}

				embed.addField(`Page`, `${page}/${maxPages}`, true)
				embed.addField(`Loop`, this.cache.service.loop ? "✅" : "❌", true)
				embed.addField(`Queue Loop`, this.cache.service.queueLoop ? "✅" : "❌", true)
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
								.setDisabled(maxPages === 1),
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
						iconURL:
							"https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/bad.png?alt=media&token=cbd48c77-784c-4f86-8de1-7335b452a894"
					})
					.setColor("#DD2E44")
			],
			components: []
		}
	}

	songFormat(song: Song): [string, string] {
		return [
			`${song.title} - ${song.artiste} | ${new DurationHelper(song.duration).format()}`,
			`Requested by <@!${song.requester}> | [Open song](${song.url})`
		]
	}
}
