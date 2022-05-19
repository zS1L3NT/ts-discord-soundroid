import { iMessageFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "leave-cleanup", "only"),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
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
			helper.respond(
				ResponseBuilder.good(`Cleared ${oldLength - newLength} songs from the queue`),
				5000
			)
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"), 5000)
		}
	}
}

export default file
