import GuildCache from "../models/GuildCache"
import ResponseBuilder from "./ResponseBuilder"
import { ButtonInteraction, InteractionReplyOptions, MessagePayload } from "discord.js"

export default class ButtonHelper {
	public cache: GuildCache
	public interaction: ButtonInteraction

	constructor(cache: GuildCache, interaction: ButtonInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: MessagePayload | InteractionReplyOptions | ResponseBuilder) {
		if (options instanceof ResponseBuilder) {
			this.interaction
				.followUp({
					embeds: [options.build()]
				})
				.catch(() => {})
		} else {
			this.interaction.followUp(options).catch(() => {})
		}
	}

	public update(options: MessagePayload | InteractionReplyOptions | ResponseBuilder) {
		if (options instanceof ResponseBuilder) {
			this.interaction.update({
				embeds: [options.build()]
			})
		} else {
			this.interaction.update(options)
		}
	}
}
