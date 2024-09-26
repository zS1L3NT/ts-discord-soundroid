import { Colors } from "discord.js"

import {
	BaseCommand,
	type CommandHelper,
	CommandType,
	IsAdminMiddleware,
	ResponseBuilder,
} from "@framework"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Changes the prefix for message commands in this server",
		options: [
			{
				name: "prefix",
				description: [
					"The message prefix to trigger message commands",
					"Leave this empty to unset the prefix",
				].join("\n"),
				type: "string" as const,
				requirements: "Text",
				required: false,
			},
		],
	}

	override only = CommandType.Slash
	override middleware = [new IsAdminMiddleware()]

	override condition() {}

	override converter() {}

	override async execute(helper: CommandHelper) {
		const prefix = helper.string("prefix")
		const oldPrefix = helper.cache.prefix

		await helper.cache.update({ prefix })
		helper.respond(ResponseBuilder.good(`Prefix changed to \`${prefix}\``))
		helper.cache.logger.log({
			member: helper.member,
			title: "Message command prefix changed",
			description: [
				`<@${helper.member.id}> changed the server's message command prefix`,
				oldPrefix ? `**Old Prefix**: ${oldPrefix}` : null,
				`**New Prefix**: ${prefix}`,
			].join("\n"),
			command: "set-prefix",
			color: Colors.Blue,
		})
	}
}
