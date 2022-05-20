import { VoiceState } from "discord.js"
import { BaseEvent } from "nova-bot"

import BotCache from "../../data/BotCache"
import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseEvent<Entry, GuildCache, BotCache, "voiceStateUpdate"> {
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
				cache.service.disconnectTimeout = setTimeout(() => {
					logger.log("One minute without any users in VC, disconnecting")
					cache.service?.destroy()
				}, 60_000)
			}
		}
	}
}
