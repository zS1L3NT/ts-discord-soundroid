import { BaseBotCache } from "nova-bot"

import { Entry } from "@prisma/client"

import prisma from "../prisma"
import ApiHelper from "../utils/ApiHelper"
import GuildCache from "./GuildCache"

export default class BotCache extends BaseBotCache<typeof prisma, Entry, GuildCache> {
	private apiHelper = new ApiHelper()

	override onSetGuildCache(cache: GuildCache) {
		cache.apiHelper = this.apiHelper
	}

	override async registerGuildCache(guildId: string) {
		await this.prisma.entry.create({
			data: {
				guild_id: guildId,
				prefix: null,
				log_channel_id: null,
				music_channel_id: null,
				music_message_id: null
			}
		})
	}

	override async eraseGuildCache(guildId: string) {
		await this.prisma.entry.delete({ where: { guild_id: guildId } })
		await this.prisma.alias.deleteMany({ where: { guild_id: guildId } })
	}
}
