import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import QueueBuilder from "../utilities/QueueBuilder"
import { GuildMember } from "discord.js"
import { iButtonFile } from "discordjs-nova"

const file: iButtonFile<iValue, Document, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		await helper.interaction.update(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build()
		)
	}
}

export default file
