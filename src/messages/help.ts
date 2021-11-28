import HelpBuilder from "../utilities/HelpBuilder"
import { iMessageFile } from "../utilities/BotSetupHelper"

const file: iMessageFile = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}help`),
	execute: async helper => {
		helper.message.channel?.send(new HelpBuilder(helper.cache).buildMinimum())
	}
}

module.exports = file
