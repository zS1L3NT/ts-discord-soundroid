import { iButtonFile } from "../utilities/BotSetupHelper"
import HelpBuilder from "../utilities/HelpBuilder"

const file: iButtonFile = {
	defer: false,
	execute: async helper => {
		await helper.interaction.update(new HelpBuilder(helper.cache).buildMaximum())
	}
}

module.exports = file
