import type { Guild } from "discord.js"

import { BaseEvent } from "@framework"

export default class extends BaseEvent<"guildDelete"> {
	override name = "guildDelete" as const

	override middleware = []

	override async execute(botCache: BotCache, guild: Guild) {
		logger.info(`Removed from Guild(${guild.name})`)
		await botCache.eraseGuildCache(guild.id)
		botCache.caches.delete(guild.id)
	}
}
