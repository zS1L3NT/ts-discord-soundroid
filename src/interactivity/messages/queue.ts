import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import QueueBuilder from "../../utilities/QueueBuilder"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}queue`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		helper.reactSuccess()
		helper.respond(await new QueueBuilder(helper.cache, member).build())
	}
}

export default file