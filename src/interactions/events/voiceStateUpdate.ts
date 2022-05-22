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
				cache.logger.log({
					title: `Stopped disconnect timer`,
					description: `A track was played within a minute of the disconnect timeout`,
					color: "GREY"
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
					color: "GREY"
				})
				cache.service.disconnectTimeout = setTimeout(() => {
					logger.log("One minute without any users in VC, disconnecting")
					cache.service?.destroy()
					cache.logger.log({
						title: `One minute without activity`,
						description: `No activity within a minute, destroying music service and disconnecting...`,
						color: "#000000"
					})
				}, 60_000)
			}
		}
	}
}
