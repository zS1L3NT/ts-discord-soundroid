import type { GuildMember, Message, StringSelectMenuInteraction } from "discord.js"

import { type CommandPayload, ResponseBuilder } from "@framework"

export default abstract class BaseSelectMenu {
	/**
	 * If the select menu interaction should be deferred
	 *
	 * @example true
	 */
	abstract defer: boolean
	/**
	 * If the select menu interaction should be ephemeral
	 *
	 * @example true
	 */
	abstract ephemeral: boolean
	/**
	 * Middleware to run before the {@link execute} method is called
	 */
	abstract middleware: SelectMenuMiddleware[]

	/**
	 * The method that is called when a select menu item is chosen
	 *
	 * @param helper The SelectMenuHelper containing information about the select menu interaction
	 */
	abstract execute(helper: SelectMenuHelper): Promise<unknown>
}

export abstract class SelectMenuMiddleware {
	/**
	 * The function that should handle the select menu interaction
	 *
	 * @param helper The SelectMenuHelper containing information about the select menu interaction
	 * @returns If the next middleware / execute method should be called
	 */
	abstract handler(helper: SelectMenuHelper): boolean | Promise<boolean>
}

export class SelectMenuHelper {
	constructor(
		public readonly cache: GuildCache,
		public readonly interaction: StringSelectMenuInteraction,
	) {}

	/**
	 * The GuildMember that pressednt the button
	 */
	get member() {
		return this.interaction.member as GuildMember
	}

	/**
	 * The Message containing this select menu
	 */
	get message() {
		return this.interaction.message as Message
	}

	/**
	 * Respond to the user with the `followUp` method on the {@link interaction}
	 *
	 * @param options The data to send back to the user
	 */
	respond(options: ResponseBuilder | CommandPayload) {
		if (options instanceof ResponseBuilder) {
			this.interaction
				.followUp({ embeds: [options.build()] })
				.catch(err => logger.warn("Failed to follow up select menu interaction", err))
		} else {
			this.interaction
				.followUp(options)
				.catch(err => logger.warn("Failed to follow up select menu interaction", err))
		}
	}

	/**
	 * Update the response to the user with the `update` method on the {@link interaction}
	 *
	 * @param options The data to send back to the user
	 */
	update(options: ResponseBuilder | CommandPayload) {
		if (options instanceof ResponseBuilder) {
			this.interaction
				.update({ embeds: [options.build()] })
				.catch(err => logger.warn("Failed to update select menu interaction", err))
		} else {
			this.interaction
				.update(options)
				.catch(err => logger.warn("Failed to update select menu interaction", err))
		}
	}

	/**
	 * The values that the user selected.
	 */
	get values() {
		return this.interaction.values
	}

	/**
	 * The first value that the user selected.
	 */
	get value() {
		return this.interaction.values[0]
	}
}
