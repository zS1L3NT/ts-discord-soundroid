import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchOnly(helper.cache.getMessageCommandRegex("queue-loop")),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			service.loop = false
			if (service.queueLoop) {
				service.queueLoop = false
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Queue Loop disabled"), 5000)
			} else {
				service.queueLoop = true
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Queue Loop enabled"), 5000)
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
