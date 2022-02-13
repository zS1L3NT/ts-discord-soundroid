import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}leave-cleanup`),
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
			const members = member.voice.channel!.members
			const oldLength = service.queue.length
			service.queue = service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = service.queue.length
			helper.cache.updateMusicChannel()
			helper.reactSuccess()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					`Cleared ${oldLength - newLength} songs from the queue`
				),
				3000
			)
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
