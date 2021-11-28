import HelpBuilder from "../utilities/HelpBuilder"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: false,
	ephemeral: false,
	help: {
		description: "Shows you the help menu that you are looking at right now",
		params: []
	},
	builder: new SlashCommandBuilder().setName("help").setDescription("Displays the help command"),
	execute: async helper => {
		helper.interaction.channel?.send(new HelpBuilder(helper.cache).buildMinimum())
	}
}

module.exports = file
