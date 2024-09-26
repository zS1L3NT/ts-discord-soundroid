import { Routes } from "discord-api-types/v10"
import { type Collection, SlashCommandBuilder } from "discord.js"

import { REST } from "@discordjs/rest"

import { type BaseCommand, SlashBuilder } from "@framework"

export default class SlashCommandDeployer {
	private readonly commands: SlashCommandBuilder[]

	constructor(
		private readonly guildId: string,
		commandFiles: Collection<string, BaseCommand>,
	) {
		this.guildId = guildId
		this.commands = Array.from(commandFiles.entries()).map(([name, file]) =>
			file.data instanceof SlashCommandBuilder
				? file.data
				: new SlashBuilder(name, file.data).buildCommand(),
		)
	}

	/**
	 * Deploys all commands to the Discord REST API
	 */
	async deploy() {
		const rest = new REST().setToken(process.env.DISCORD__TOKEN)
		await rest.put(Routes.applicationGuildCommands(process.env.DISCORD__BOT_ID, this.guildId), {
			body: this.commands.map(command => command.toJSON()),
		})
	}
}
