import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"

const file: iMessageFile<iValue, Document, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}remove`),
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
			if (from >= service.queue.length) {
				helper.reactFailure()
				helper.respond(
					new ResponseBuilder(Emoji.BAD, "No such starting position in the queue"),
					5000
				)
			} else {
				if (to) {
					if (to <= from || to >= service.queue.length) {
						helper.reactFailure()
						helper.respond(
							new ResponseBuilder(
								Emoji.BAD,
								"Invalid ending position in queue, ensure the end position is greater than the start position"
							),
							5000
						)
					} else {
						const delete_count = to - from + 1
						service.queue.splice(from, delete_count)
						helper.cache.updateMusicChannel()
						helper.reactSuccess()
						helper.respond(
							new ResponseBuilder(
								Emoji.GOOD,
								`Removed ${delete_count} songs from the queue`
							),
							5000
						)
					}
				} else {
					const song = service.queue.splice(from, 1)[0]
					helper.cache.updateMusicChannel()
					helper.reactSuccess()
					helper.respond(
						new ResponseBuilder(
							Emoji.GOOD,
							`Removed 1 song from queue: "${song.title} - ${song.artiste}"`
						),
						5000
					)
				}
			}
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
