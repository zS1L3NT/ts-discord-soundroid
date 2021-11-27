import EmbedResponse from "./EmbedResponse"
import GuildCache from "../models/GuildCache"
import { InteractionReplyOptions, MessagePayload, SelectMenuInteraction } from "discord.js"

export default class MenuHelper {
	public cache: GuildCache
	public interaction: SelectMenuInteraction

	constructor(cache: GuildCache, interaction: SelectMenuInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: MessagePayload | InteractionReplyOptions | EmbedResponse) {
		if (options instanceof EmbedResponse) {
			this.interaction
				.followUp({
					embeds: [options.create()]
				})
				.catch(() => {})
		} else {
			this.interaction.followUp(options).catch(() => {})
		}
	}

	public value(): string | undefined {
		return this.interaction.values[0]
	}
}
