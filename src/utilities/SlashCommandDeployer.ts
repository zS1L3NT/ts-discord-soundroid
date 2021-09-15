import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { SlashCommandBuilder } from "@discordjs/builders"

export default class SlashCommandDeployer {
	private readonly guildId: string
	private commands: SlashCommandBuilder[]

	public constructor(guildId: string) {
		this.commands = []
		this.guildId = guildId
	}

	public addCommand(command: SlashCommandBuilder) {
		this.commands.push(command)
	}

	public async deploy() {
		const rest = new REST({ version: "9" }).setToken(JSON.parse(process.env.discord!).token)
		await rest.put(
			Routes.applicationGuildCommands(
				JSON.parse(process.env.discord!).bot_id,
				this.guildId
			),
			{
				body: this.commands.map(command => command.toJSON())
			}
		)
	}
}