import { VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore("\\.move"),
	execute: async helper => {
		const member = helper.message.member!
		if (!(member.voice.channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}
		
		const [from_str, , to_str] = helper.match("\\.move *(\\d*) *(\\d*)$")!
		const from = +from_str
		const to = to_str ? +to_str : null

		if (isNaN(from)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(Emoji.BAD, `Invalid "from" position: ${from}`),
				5000
			)
		}

		if (to !== null && isNaN(to)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(Emoji.BAD, `Invalid "to" position: ${to}`),
				5000
			)
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue
			const song = queue[from]

			if (from < 1 || from >= queue.length) {
				helper.reactFailure()
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Invalid "from" position: ${from}`),
					5000
				)
			}

			if (to && (to < 1 || to > queue.length)) {
				helper.reactFailure()
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Invalid "to" position: ${to}`),
					5000
				)
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.cache.updateMusicChannel()
			helper.reactSuccess()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Moved "${song.title} - ${song.artiste}" from ${from} to ${
						to ?? `top of the queue`
					}`
				),
				5000
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
