import { Colors } from "discord.js"

import {
	BaseCommand,
	type CommandHelper,
	CommandType,
	IsAdminMiddleware,
	ResponseBuilder,
	aliases,
	type iSlashStringOption,
} from "@framework"
import { and, eq } from "drizzle-orm"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Sets an alias for a specific message command",
		options: [
			{
				name: "command",
				description: "The command you want to set the alias for",
				type: "string" as const,
				choices: [],
				requirements: "Valid message command",
				required: true,
			},
			{
				name: "alias",
				description: [
					"The alias you want to set",
					"Leave empty to unset the alias for this command",
				].join("\n"),
				type: "string" as const,
				requirements: "Alphabetic text",
				required: false,
			},
		],
	}

	override only = CommandType.Slash
	override middleware = [new IsAdminMiddleware()]

	constructor(public commands: string[]) {
		super()
		;(this.data.options[0]! as iSlashStringOption).choices = commands
			.map(f => f.split(".")[0]!)
			.map(c => ({ name: c, value: c }))
	}

	override condition() {}

	override converter() {}

	override async execute(helper: CommandHelper) {
		const command = helper.string("command")!
		const alias = helper.string("alias")

		const alias_ = helper.cache.aliases.find(a => a.alias === alias)
		if (alias) {
			if (!alias.match(/^[a-zA-Z]+$/)) {
				return helper.respond(ResponseBuilder.bad("Alias must be alphabetical!"))
			}

			if (this.commands.includes(alias) ?? !!alias_) {
				return helper.respond(ResponseBuilder.bad("Alias is already in use!"))
			}

			await helper.cache.db
				.insert(aliases)
				.values({ alias, command, guild_id: helper.cache.guild.id })
			helper.respond(ResponseBuilder.good(`Set Alias for \`${command}\` to \`${alias}\``))
			helper.cache.logger.log({
				member: helper.member,
				title: "Alias added",
				description: [
					`<@${helper.member.id}> added an alias for a command`,
					`**Command**: ${command}`,
					`**Alias**: ${alias}`,
				].join("\n"),
				command: "set-alias",
				color: Colors.Blue,
			})
		} else {
			if (!alias_) {
				return helper.respond(ResponseBuilder.bad("There is no Alias for this command!"))
			}

			await helper.cache.db
				.delete(aliases)
				.where(and(eq(aliases.alias, alias_.alias), eq(aliases.command, command)))
			helper.respond(ResponseBuilder.good(`Removed Alias for \`${command}\``))
			helper.cache.logger.log({
				member: helper.member,
				title: "Alias removed",
				description: [
					`<@${helper.member.id}> removed an alias for a command`,
					`**Command**: ${command}`,
					`**Alias**: ${alias}`,
				].join("\n"),
				command: "set-alias",
				color: Colors.Blue,
			})
		}
	}
}
