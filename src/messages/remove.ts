import { iMessageFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}remove`),
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

		const [from_str, , to_str] = helper.match(
			`\\${helper.cache.getPrefix()}remove *(\\d*) *(\\d*)$`
		)!
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
			if (from < 1 || from >= helper.cache.service.queue.length) {
				helper.reactFailure()
				helper.respond(
					new EmbedResponse(Emoji.BAD, "No such starting position in the queue"),
					5000
				)
			} else {
				if (to) {
					if (to <= from || to >= helper.cache.service.queue.length) {
						helper.reactFailure()
						helper.respond(
							new EmbedResponse(
								Emoji.BAD,
								"Invalid ending position in queue, ensure the end position is greater than the start position"
							),
							5000
						)
					} else {
						const delete_count = to - from + 1
						helper.cache.service.queue.splice(from, delete_count)
						helper.cache.updateMusicChannel()
						helper.reactSuccess()
						helper.respond(
							new EmbedResponse(
								Emoji.GOOD,
								`Removed ${delete_count} songs from the queue`
							),
							5000
						)
					}
				} else {
					const song = helper.cache.service.queue.splice(from, 1)[0]
					helper.cache.updateMusicChannel()
					helper.reactSuccess()
					helper.respond(
						new EmbedResponse(
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
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
