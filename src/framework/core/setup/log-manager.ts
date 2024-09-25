import {
	type Colors,
	EmbedBuilder,
	type GuildMember,
	PermissionFlagsBits,
	TextChannel,
} from "discord.js"

import type { PrismaClient } from "@prisma/client"

import type { BaseEntry, BaseGuildCache } from "@framework"

type LogData = {
	member?: GuildMember
	title: string
	description: string | string[]
	command?: string
	color?: (typeof Colors)[keyof typeof Colors]
	embeds?: EmbedBuilder[]
}

export default class LogManager<
	P extends PrismaClient,
	E extends BaseEntry,
	GC extends BaseGuildCache<P, E, GC>,
> {
	constructor(private readonly cache: BaseGuildCache<P, E, GC>) {}

	/**
	 * Log the data to the log channel if the `log_channel_id` is set.
	 *
	 * @param data Payload to log to the log channel if it is set
	 */
	async log(data: LogData) {
		const logChannelId = this.cache.entry.log_channel_id
		if (!logChannelId) return

		const logChannel = this.cache.guild.channels.cache.get(logChannelId)
		if (!(logChannel instanceof TextChannel)) {
			console.error(`Guild(${this.cache.guild.name}) has no TextChannel(${logChannelId})`)
			await this.cache.update({ log_channel_id: null })
			return
		}

		const member = this.cache.guild.members.cache.find(
			m => m.user.id === this.cache.bot.user!.id,
		)!
		if (member.permissions.has(PermissionFlagsBits.SendMessages)) {
			logChannel.send({
				embeds: [
					new EmbedBuilder({
						author: data.member
							? {
									name: data.member.user.tag,
									iconURL: data.member.user.displayAvatarURL(),
								}
							: undefined,
						title: data.title,
						description: Array.isArray(data.description)
							? data.description.filter(s => s !== null).join("\n")
							: data.description,
						color: data.color,
						timestamp: new Date(),
						footer: data.command
							? {
									text: `Command: ${data.command}`,
								}
							: undefined,
					}),
					...(data.embeds ?? []),
				],
			})
		}
	}
}
