import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "prefix",
		description: {
			slash: "Change the prefix for message commands",
			help: "Changes the prefix for message commands in this server"
		},
		options: [
			{
				name: "prefix",
				description: {
					slash: "Message Command prefix",
					help: "Message prefix to activate message commands"
				},
				type: "string",
				requirements: "Any single character",
				required: true
			}
		]
	},
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
