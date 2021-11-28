import QueueFormatter from "../utilities/QueueFormatter"
import { GuildMember } from "discord.js"
import { iButtonFile } from "../utilities/BotSetupHelper"

const file: iButtonFile = {
	defer: false,
	execute: async helper => {
		await helper.interaction.update(
			await new QueueFormatter(
				helper.cache,
				helper.interaction.member as GuildMember
			).getMessagePayload()
		)
	}
}

module.exports = file
