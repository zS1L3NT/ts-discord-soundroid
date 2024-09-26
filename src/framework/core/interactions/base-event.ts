import type { ClientEvents } from "discord.js"

export default abstract class BaseEvent<N extends keyof ClientEvents = keyof ClientEvents> {
	/**
	 * The name of the event
	 *
	 * @example "messageCreate"
	 */
	abstract name: N
	/**
	 * Middleware to run before the {@link execute} method is called
	 */
	abstract middleware: EventMiddleware[]

	/**
	 * The method that is called when the event is emitted
	 *
	 * @param botCache The BotCache to possibly fetch a GuildCache
	 * @param args The args of the client event
	 */
	abstract execute(botCache: BotCache, ...args: ClientEvents[N]): Promise<unknown>
}

export abstract class EventMiddleware<N extends keyof ClientEvents = keyof ClientEvents> {
	/**
	 * The function that should handle the event
	 *
	 * @param botCache The BotCache to possibly fetch a GuildCache
	 * @param args The args of the client event
	 */
	abstract handler(botCache: BotCache, ...args: ClientEvents[N]): boolean | Promise<boolean>
}
