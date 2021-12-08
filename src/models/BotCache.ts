import ApiHelper from "../utilities/ApiHelper"
import Document, { iValue } from "./Document"
import GuildCache from "./GuildCache"
import { BaseBotCache } from "discordjs-nova"

export default class BotCache extends BaseBotCache<Entry, GuildCache> {
	private apiHelper: ApiHelper = new ApiHelper()

	public onConstruct(): void {}

	public onSetGuildCache(cache: GuildCache): void {
		cache.apiHelper = this.apiHelper
	}

	public async registerGuildCache(guildId: string): Promise<void> {
		const doc = await this.ref.doc(guildId).get()
		if (!doc.exists) {
			await this.ref.doc(guildId).set(new Document().getEmpty().value)
		}
	}

	public async eraseGuildCache(guildId: string): Promise<void> {
		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			await this.ref.doc(guildId).delete()
		}
		this.guilds.delete(guildId)
	}
}
