import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "play-again",
		description: {
			slash: "Play the current song again",
			help: "Plays the current playing song again as many times as specified"
		},
		options: [
			{
				name: "count",
				description: {
					slash: "Number of times to play the current song again",
					help: "This is the number of times you want the song to play again"
				},
				type: "number",
				requirements: "Number between 1 and 1000",
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
			const song = service.queue.at(0)
			if (!song) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No song playing right now"))
			}

			const count = helper.integer("count") || 1

			if (count < 1) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid play count: ${count}`)
				)
			}

			if (count > 1000) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Play again count cannot exceed 1000`)
				)
			}

			service.queue.splice(1, 0, ...Array(count).fill(song))
			helper.cache.updateMusicChannel()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					`Playing "${song.title} - ${song.artiste}" again ${count} times`
				)
			)
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
