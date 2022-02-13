import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import { StopStatus } from "../../data/MusicService"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}clear-queue`),
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

		const service = helper.cache.service
		if (service) {
			service.queue.length = 0
			service.stop_status = StopStatus.INTENTIONAL
			service.player.stop()
			helper.reactSuccess()
			helper.cache.updateMusicChannel()
		} else {
			helper.reactFailure()
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
