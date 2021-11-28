import EmbedResponse from "./EmbedResponse"
import GuildCache from "../models/GuildCache"
import { InteractionReplyOptions, Message, MessagePayload } from "discord.js"

const time = (ms: number) => new Promise(res => setTimeout(res, ms))

export default class MessageHelper {
	public cache: GuildCache
	public message: Message

	public constructor(cache: GuildCache, message: Message) {
		this.cache = cache
		this.message = message
	}

	public match(regexp: string) {
		const regex = this.message.content.match(new RegExp(regexp))
		return regex ? regex.slice(1) : null
	}

	public matchOnly(command: string) {
		return !!this.match(`^${command}(?:(?= *$)(?!\\w+))`)
	}

	public matchMore(command: string) {
		return !!this.match(`^${command}(?:(?= *)(?!\\w+))`)
	}

	public input() {
		return this.match(`^\\S* *(.*)`)?.[0]
			?.replaceAll("  ", " ")
			?.split(" ")
			?.filter(i => i !== "")
	}

	public getNumber<T, U>(string: string | undefined, not_defined: T, nan: U) {
		return string === undefined ? not_defined : isNaN(+string) ? nan : +string
	}

	public clearAfter(ms: number) {
		setTimeout(() => {
			this.message.delete().catch(() => {})
		}, ms)
	}

	public reactSuccess() {
		this.message.react("✅").catch(() => {})
	}

	public reactFailure() {
		this.message.react("❌").catch(() => {})
	}

	public respond(options: MessagePayload | InteractionReplyOptions | EmbedResponse, ms?: number) {
		let message: Promise<Message>

		if (options instanceof EmbedResponse) {
			message = this.message.channel.send({
				embeds: [options.create()]
			})
		} else {
			message = this.message.channel.send(options as MessagePayload | InteractionReplyOptions)
		}

		message
			.then(async temporary => {
				if (ms) {
					await time(ms)
					await temporary.delete().catch(() => {})
				}
			})
			.catch(() => {})
	}
}
