import { CommandInteraction, InteractionReplyOptions, MessageEmbed, MessagePayload } from "discord.js"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionEmbed } from "./BotSetupHelper"

export default class InteractionHelper {
	public cache: GuildCache
	public interaction: CommandInteraction

	public constructor(cache: GuildCache, interaction: CommandInteraction) {
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

	public mentionable(name: string, required?: boolean) {
		return this.interaction.options.getMentionable(name, required)
	}

	public channel(name: string, required?: boolean) {
		return this.interaction.options.getChannel(name, required)
	}

	public role(name: string, required?: boolean) {
		return this.interaction.options.getRole(name, required)
	}

	public user(name: string, required?: boolean) {
		return this.interaction.options.getUser(name, required)
	}

	public string(name: string, required?: boolean) {
		return this.interaction.options.getString(name, required)
	}

	public integer(name: string, required?: boolean) {
		return this.interaction.options.getInteger(name, required)
	}

	public boolean(name: string, required?: boolean) {
		return this.interaction.options.getBoolean(name, required)
	}
}
