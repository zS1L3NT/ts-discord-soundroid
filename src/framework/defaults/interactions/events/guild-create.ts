import type { Guild } from "discord.js"

import type { PrismaClient } from "@prisma/client"

import {
	type BaseBotCache,
	type BaseEntry,
	BaseEvent,
	type BaseGuildCache,
	type FilesSetupHelper,
	SlashCommandDeployer,
} from "@framework"

export default class<
	P extends PrismaClient,
	E extends BaseEntry,
	GC extends BaseGuildCache<P, E, GC>,
	BC extends BaseBotCache<P, E, GC>,
> extends BaseEvent<P, E, GC, BC, "guildCreate"> {
	override name = "guildCreate" as const

	override middleware = []

	constructor(public fsh: FilesSetupHelper<P, E, GC, BC>) {
		super()
	}

	override async execute(botCache: BC, guild: Guild) {
		logger.info(`Added to Guild(${guild.name})`)
		await botCache.registerGuildCache(guild.id)
		await new SlashCommandDeployer(guild.id, this.fsh.commandFiles).deploy()
	}
}
