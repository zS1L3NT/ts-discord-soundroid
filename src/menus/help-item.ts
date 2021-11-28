import { iMenuFile } from "../utilities/BotSetupHelper"
import HelpBuilder from "../utilities/HelpBuilder"

const file: iMenuFile = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		helper.interaction.update(new HelpBuilder(helper.cache).buildCommand(helper.value()!))
	}
}

module.exports = file
