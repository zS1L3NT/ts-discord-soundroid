import type { Guild } from "discord.js"

import { BaseEvent, type FilesSetupHelper, SlashCommandDeployer } from "@framework"

export default class extends BaseEvent<"guildCreate"> {
	override name = "guildCreate" as const

	override middleware = []

	constructor(public fsh: FilesSetupHelper) {
		super()
	}

	override async execute(botCache: BotCache, guild: Guild) {
		logger.info(`Added to Guild(${guild.name})`)
		await botCache.registerGuildCache(guild.id)
		await new SlashCommandDeployer(guild.id, this.fsh.commandFiles).deploy()
	}
}
