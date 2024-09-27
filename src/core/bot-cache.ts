import { BaseBotCache, aliases } from "@framework"

import { eq } from "drizzle-orm"
import { servers } from "../schema"
import ApiHelper from "../utils/api-helper"
import type GuildCache from "./guild-cache"

export default class BotCache extends BaseBotCache {
	private apiHelper = new ApiHelper()

	override onSetGuildCache(cache: GuildCache) {
		cache.apiHelper = this.apiHelper
	}

	override async registerGuildCache(guildId: string) {
		await this.db.insert(servers).values({
			guild_id: guildId,
			prefix: null,
			log_channel_id: null,
			music_channel_id: null,
			music_message_id: null,
		})
	}

	override async eraseGuildCache(guildId: string) {
		await this.db.delete(servers).where(eq(servers.guild_id, guildId))
		await this.db.delete(aliases).where(eq(aliases.guild_id, guildId))
	}
}
