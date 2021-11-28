import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"
import { GuildMember } from "discord.js"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Sets the prefix for message commands in this server",
		params: [
			{
				name: "prefix",
				description: "Message prefix to activate message commands",
				requirements: "Any single character",
				required: true
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("prefix")
		.setDescription("Change the prefix for message commands")
		.addStringOption(option =>
			option.setName("prefix").setDescription("Prefix to change to").setRequired(true)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const prefix = helper.string("prefix")!
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Only administrators can set the prefix")
			)
		}

		if (prefix.length !== 1) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Prefix must be only one character long")
			)
		}

		await helper.cache.ref.set({ prefix }, { merge: true })
		helper.respond(new ResponseBuilder(Emoji.GOOD, `Prefix changed to \`${prefix}\``))
	}
}

module.exports = file
