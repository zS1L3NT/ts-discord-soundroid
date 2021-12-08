import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}move`),
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

		const [from_str, to_str] = helper.input()!

		const from = helper.getNumber(from_str, 0, 0)
		if (from < 1) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, `Invalid "from" position: ${from}`),
				5000
			)
		}

		const to = helper.getNumber(to_str, null, 0)
		if (to && to < 1) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, `Invalid "to" position: ${to}`),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			const queue = service.queue
			const song = queue[from]

			if (from >= queue.length) {
				helper.reactFailure()
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid "from" position: ${from}`),
					5000
				)
			}

			if (to && to > queue.length) {
				helper.reactFailure()
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid "to" position: ${to}`),
					5000
				)
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.cache.updateMusicChannel()
			helper.reactSuccess()
			helper.respond(
				new ResponseBuilder(
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
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
