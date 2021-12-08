import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember } from "discord.js"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		description: {
			slash: "",
			help: "Sets the prefix for message commands in this server"
		},
		options: [
			{
				name: "prefix",
				description: {
					slash: "",
					help: "Message prefix to activate message commands"
				}
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

export default file
