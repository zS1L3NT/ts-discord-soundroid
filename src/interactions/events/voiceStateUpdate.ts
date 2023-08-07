import { Colors, VoiceState } from "discord.js"
import { BaseEvent } from "nova-bot"

import { Entry } from "@prisma/client"

import BotCache from "../../data/BotCache"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"
import prisma from "../../prisma"

export default class extends BaseEvent<
	typeof prisma,
	Entry,
	GuildCache,
	BotCache,
	"voiceStateUpdate"
> {
	override name = "voiceStateUpdate" as const

	override middleware = []

	override async execute(botCache: BotCache, oldState: VoiceState, newState: VoiceState) {
		if (newState.channel) {
			const cache = await botCache.getGuildCache(newState.guild)
			if (!cache.service) return

			if (
				newState.channel.members.size >= 2 &&
				newState.channel.members.find(m => m.id === process.env.DISCORD__BOT_ID) &&
				cache.service.disconnectTimeout
			) {
				logger.log("Clearing previous disconnect timeout")
				clearTimeout(cache.service.disconnectTimeout)
				cache.service.disconnectTimeout = null
				cache.logger.log({
					title: `Stopped disconnect timer`,
					description: `A track was played within a minute of the disconnect timeout`,
					color: Colors.Grey,
				})
			}
		}

		if (oldState.channel) {
			const cache = await botCache.getGuildCache(oldState.guild)
			if (!cache.service) return

			if (
				oldState.channel.members.size === 1 &&
				oldState.channel.members.at(0)!.id === process.env.DISCORD__BOT_ID
			) {
				logger.log("No one in VC, setting one minute disconnect timeout")
				cache.logger.log({
					title: `Waiting 1 minute before disconnecting`,
					description: `If no one is listening, the bot will disconnect after 1 minute`,
					color: Colors.Grey,
				})
				cache.service.disconnectTimeout = setTimeout(() => {
					logger.log("One minute without any users in VC, disconnecting")
					cache.service?.destroy()
					cache.logger.log({
						title: `One minute without activity`,
						description: `No activity within a minute, destroying music service and disconnecting...`,
						color: 0x000000,
					})
				}, 60_000)
			} else if (!newState.channel && oldState.member?.id === process.env.DISCORD__BOT_ID) {
				logger.log("Bot was disconnected from voice channel")
				cache.service?.destroy()
				cache.logger.log({
					title: `Bot was disconnected`,
					description: `Immediately destroying music service`,
					color: 0x000000,
				})
			}
		}
	}
}
