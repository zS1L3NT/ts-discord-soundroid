import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "move",
		description: {
			slash: "Change a song's position in the queue",
			help: "Move a song in the queue to a specified position"
		},
		options: [
			{
				name: "from",
				description: {
					slash: "Song in the queue that you want to move",
					help: "This is the song's position in the queue that you want to move"
				},
				type: "number",
				requirements: "Number that references a song in the queue",
				required: true
			},
			{
				name: "to",
				description: {
					slash: "Position to move the song to. The song currently at this position will get pushed down",
					help: [
						"This is the position in the queue to move the song to",
						"The song at this position in the queue will get pushed down",
						"Moves the song to the top of a queue if this isn't provided"
					].join("\n")
				},
				type: "number",
				requirements: "Number that references a position in the queue",
				required: false,
				default: "1"
			}
		]
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			const from = helper.integer("from")!
			const to = helper.integer("to")

			const queue = service.queue
			const song = queue[from]

			if (from < 1 || from >= queue.length) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid "from" position: ${from}`)
				)
			}

			if (to && (to < 1 || to > queue.length)) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid "to" position: ${to}`)
				)
			}

			if (!song) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `No song at position: ${from}`)
				)
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.cache.updateMusicChannel()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					`Moved "${song.title} - ${song.artiste}" from ${from} to ${
						to ?? `top of the queue`
					}`
				)
			)
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
