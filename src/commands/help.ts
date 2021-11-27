import { SlashCommandBuilder } from "@discordjs/builders"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import HelpBuilder from "../utilities/HelpBuilder"

const file: iInteractionFile = {
	builder: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Displays the help command"),
	execute: async helper => {
		helper.interaction.channel?.send({
			embeds: [new HelpBuilder().build()]
		})
	}
}

module.exports = file
