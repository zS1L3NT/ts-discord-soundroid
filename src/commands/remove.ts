import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember } from "discord.js"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "remove",
		description: {
			slash: "Removes a song or a few songs from the queue",
			help: "Removes songs from the queue with either the song position or a range"
		},
		options: [
			{
				name: "from",
				description: {
					slash: "The song to remove or the position to start removing from",
					help: [
						"If you define a `to` position later, this will be the starting position in the queue to remove",
						"If not, this will be the song to remove"
					].join("\n")
				},
				type: "number",
				requirements: "Number that references a song in the queue",
				required: true
			},
			{
				name: "to",
				description: {
					slash: "The last song to remove in the queue",
					help: "If this is defined, will remove all the songs between `from` defined earlier and this position"
				},
				type: "number",
				requirements: [
					"Number that references a song in the queue",
					"Cannot be smaller than `from` position specified earlier"
				].join("\n"),
				required: false
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

		const from = helper.integer("from")!
		const to = helper.integer("to")

		const service = helper.cache.service
		if (service) {
			if (from < 1 || from >= service.queue.length) {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, "No such starting position in the queue")
				)
			} else {
				if (to) {
					if (to <= from || to >= service.queue.length) {
						helper.respond(
							new ResponseBuilder(
								Emoji.BAD,
								"Invalid ending position in queue, ensure the end position is greater than the start position"
							)
						)
					} else {
						const delete_count = to - from + 1
						service.queue.splice(from, delete_count)
						helper.cache.updateMusicChannel()
						helper.respond(
							new ResponseBuilder(
								Emoji.GOOD,
								`Removed ${delete_count} songs from the queue`
							)
						)
					}
				} else {
					const song = service.queue.splice(from, 1)[0]
					helper.cache.updateMusicChannel()
					helper.respond(
						new ResponseBuilder(
							Emoji.GOOD,
							`Removed 1 song from queue: "${song.title} - ${song.artiste}"`
						)
					)
				}
			}
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
