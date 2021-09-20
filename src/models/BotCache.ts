import admin from "firebase-admin"
import { Client, Collection, Guild } from "discord.js"
import GuildCache from "./GuildCache"
import Document, { iDocument } from "./Document"
import ApiHelper from "../utilities/ApiHelper"

export default class BotCache {
	public bot: Client
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: Collection<string, GuildCache>
	private readonly apiHelper: ApiHelper

	public constructor(bot: Client) {
		admin.initializeApp({
			credential: admin.credential.cert(JSON.parse(process.env.firebase!).service_account)
		})
		this.bot = bot
		this.ref = admin.firestore().collection(JSON.parse(process.env.firebase!).collection)
		this.guilds = new Collection<string, GuildCache>()
		this.apiHelper = new ApiHelper()
	}

	public getGuildCache(guild: Guild): Promise<GuildCache> {
		return new Promise<GuildCache>((resolve, reject) => {
			const cache = this.guilds.get(guild.id)
			if (!cache) {
				this.guilds.set(guild.id, new GuildCache(
					this.bot,
					guild,
					this.apiHelper,
					this.ref.doc(guild.id),
					resolve
				))

				this.ref.doc(guild.id).get().then(snap => {
					if (!snap.exists) reject()
				})
			}
			else {
				resolve(cache)
			}
		})
	}

	public async createGuildCache(guild: Guild) {
		const doc = await this.ref.doc(guild.id).get()
		if (!doc.exists) {
			await this.ref.doc(guild.id).set(Document.getEmpty().value)
		}
		await this.getGuildCache(guild)
	}

	public async deleteGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			await this.ref.doc(guildId).delete()
		}
		this.guilds.delete(guildId)

		// Clean up collections if you need to
	}
}
