import { BaseBotCache } from "nova-bot"

import ApiHelper from "../utils/ApiHelper"
import Entry from "./Entry"
import GuildCache from "./GuildCache"

export default class BotCache extends BaseBotCache<Entry, GuildCache> {
	private apiHelper = new ApiHelper()

	onConstruct() {}

	onSetGuildCache(cache: GuildCache) {
		cache.apiHelper = this.apiHelper
	}

	async registerGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (!doc.exists) {
			await this.ref.doc(guildId).set(this.getEmptyEntry())
		}
	}

	async eraseGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			await this.ref.doc(guildId).delete()
		}
	}

	getEmptyEntry(): Entry {
		return {
			prefix: "",
			aliases: {},
			log_channel_id: "",
			music_channel_id: "",
			music_message_id: ""
		}
	}
}
