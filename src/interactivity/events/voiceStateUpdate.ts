import BotCache from "../../data/BotCache"
import config from "../../config.json"
import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { iEventFile } from "nova-bot"

const file: iEventFile<Entry, GuildCache, BotCache, "voiceStateUpdate"> = {
	name: "voiceStateUpdate",
	execute: async (botCache, oldState, newState) => {
		if (newState.channel) {
			const cache = await botCache.getGuildCache(newState.guild)
			if (!cache.service) return

			if (
				newState.channel.members.size >= 2 &&
				newState.channel.members.find(m => m.id === config.discord.bot_id) &&
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
				oldState.channel.members.at(0)!.id === config.discord.bot_id
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

export default file
