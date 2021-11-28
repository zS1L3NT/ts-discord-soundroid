import QueueBuilder from "../utilities/QueueBuilder"
import { GuildMember } from "discord.js"
import { iButtonFile } from "../utilities/BotSetupHelper"

const file: iButtonFile = {
	defer: false,
	execute: async helper => {
		await helper.interaction.update(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build()
		)
	}
}

module.exports = file
