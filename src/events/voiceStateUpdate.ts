import BotCache from "../models/BotCache"
import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { iEventFile } from "nova-bot"

const config = require("../../config.json")

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
				cache.service.disconnectTimeout = setTimeout(() => {
					cache.service?.destroy()
				}, 60_000)
			}
		}
	}
}

export default file