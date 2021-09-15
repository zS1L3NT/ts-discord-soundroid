import GuildCache from "../models/GuildCache"
import { ButtonInteraction, InteractionReplyOptions, MessageEmbed, MessagePayload } from "discord.js"
import { Emoji, iInteractionEmbed } from "./BotSetupHelper"

export default class ButtonHelper {
	public cache: GuildCache
	public interaction: ButtonInteraction

	constructor(cache: GuildCache, interaction: ButtonInteraction) {
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
}