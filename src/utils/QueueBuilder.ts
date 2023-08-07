import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	GuildMember,
} from "discord.js"
import { CommandPayload } from "nova-bot"

import GuildCache from "../data/GuildCache"
import Song from "../data/Song"
import DominantColorGetter from "./DominantColorGetter"
import DurationHelper from "./DurationHelper"

export default class QueueBuilder {
	constructor(
		private cache: GuildCache,
		private member?: GuildMember,
	) {}

	async build(page: number = 1): Promise<CommandPayload> {
		if (this.cache.service) {
			const embed = new EmbedBuilder()
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
			embed.addFields({
				name: `\u200B`,
				value: `__Now Playing:__`,
			})

			if (song) {
				embed.addFields(this.songFormat(song))
				embed.setThumbnail(song.cover)
				try {
					embed.setColor(await new DominantColorGetter(song.cover).getColor())
				} catch {
					// Ignore errors
				}
			} else {
				embed.addFields({
					name: `Not playing anything at the moment`,
					value: `\u200B`,
				})
			}

			if (this.cache.service) {
				if (queue.length > 0) {
					embed.addFields([{ name: `\u200B`, value: `__Queue:__` }])
					queue.forEach((song, i) => {
						const songIndex = `\`${pageOffset + i + 1}.\` `
						const fieldFormat = this.songFormat(song)
						embed.addFields({
							name: songIndex + fieldFormat.name,
							value: fieldFormat.value,
						})
					})
					embed.addFields({
						name: `\u200B`,
						value: `**${
							this.cache.service.queue.length - 1
						} songs in queue | ${new DurationHelper(
							playingDuration,
						).format()} total length**`,
					})
				}

				embed.addFields(
					{
						name: "Page",
						value: `${page}/${maxPages}`,
						inline: true,
					},
					{
						name: "Loop",
						value: this.cache.service.loop ? "✅" : "❌",
						inline: true,
					},
					{
						name: "Queue Loop",
						value: this.cache.service.queueLoop ? "✅" : "❌",
						inline: true,
					},
				)
				if (this.member) {
					embed.setFooter({
						text: `Requested by @${this.member.displayName}`,
						iconURL: this.member.user.displayAvatarURL(),
					})
				}

				return {
					embeds: [embed],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setCustomId("queue-page-select")
								.setStyle(ButtonStyle.Primary)
								.setLabel("Choose page")
								.setDisabled(maxPages === 1),
							new ButtonBuilder()
								.setCustomId("refresh")
								.setStyle(ButtonStyle.Success)
								.setLabel("Refresh queue"),
						]),
					],
				}
			}
		}

		return {
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: "I am not currently in a voice channel",
						iconURL:
							"https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/bad.png?alt=media&token=cbd48c77-784c-4f86-8de1-7335b452a894",
					})
					.setColor(Colors.Red),
			],
			components: [],
		}
	}

	songFormat(song: Song): {
		name: string
		value: string
	} {
		return {
			name: `${song.title} - ${song.artiste} | ${new DurationHelper(song.duration).format()}`,
			value: `Requested by <@!${song.requester}> | [Open song](${song.url})`,
		}
	}
}
