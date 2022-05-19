import { GuildMember } from "discord.js"
import { iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../../data/Entry"
import GuildCache from "../../../data/GuildCache"

const file: iSlashSubFile<Entry, GuildCache> = {
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
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== process.env.DISCORD__DEV_ID) {
			return helper.respond(ResponseBuilder.bad("Only administrators can set the prefix"))
		}

		if (prefix.length !== 1) {
			return helper.respond(ResponseBuilder.bad("Prefix must be only one character long"))
		}

		await helper.cache.ref.set({ prefix }, { merge: true })
		helper.respond(ResponseBuilder.good(`Prefix changed to \`${prefix}\``))
	}
}

export default file
