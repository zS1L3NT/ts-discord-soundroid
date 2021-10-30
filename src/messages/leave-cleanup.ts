import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}leave-cleanup`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		if (helper.cache.service) {
			const members = member.voice.channel!.members
			const oldLength = helper.cache.service.queue.length
			helper.cache.service.queue = helper.cache.service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = helper.cache.service.queue.length
			helper.cache.updateMusicChannel()
			helper.reactSuccess()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Cleared ${oldLength - newLength} songs from the queue`
				),
				3000
			)
		} else {
			helper.reactFailure()
			helper.respond(
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
