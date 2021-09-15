import { InteractionReplyOptions, MessageEmbed, MessagePayload, SelectMenuInteraction } from "discord.js"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionEmbed } from "./BotSetupHelper"

export default class MenuHelper {
	public cache: GuildCache
	public interaction: SelectMenuInteraction

	constructor(cache: GuildCache, interaction: SelectMenuInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: MessagePayload | InteractionReplyOptions | iInteractionEmbed) {
		const interactionEmbed = options as iInteractionEmbed
		if (interactionEmbed.emoji) {
			this.interaction.followUp({
				embeds: [
					new MessageEmbed()
						.setAuthor(interactionEmbed.message, interactionEmbed.emoji)
						.setColor(interactionEmbed.emoji === Emoji.GOOD ? "#77B255" : "#DD2E44")
				]
			}).catch()
		} else {
			this.interaction.followUp(
				options as MessagePayload | InteractionReplyOptions
			).catch()
		}
	}

	public value(): string | undefined {
		return this.interaction.values[0]
	}
}