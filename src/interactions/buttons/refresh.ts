import { GuildMember } from "discord.js"
import { iButtonFile } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import QueueBuilder from "../../utils/QueueBuilder"

const file: iButtonFile<Entry, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		await helper.interaction.update(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build()
		)
	}
}

export default file
