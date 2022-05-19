import { GuildMember } from "discord.js"
import { iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { StopStatus } from "../../data/MusicService"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "skip",
		description: {
			slash: "Skip current playing song and songs in queue",
			help: "Skips songs in the queue as many times as specified"
		},
		options: [
			{
				name: "count",
				description: {
					slash: "Number of songs to skip",
					help: "The number of times you want to skip the current song"
				},
				type: "number",
				requirements: "Number",
				required: false,
				default: "1"
			}
		]
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			const count = helper.integer("count") || 1
			if (count < 1) {
				return helper.respond(ResponseBuilder.bad(`Invalid skip count: ${count}`))
			}

			const queue = [...service.queue]
			if (count >= queue.length && count > 1) {
				return helper.respond(
					ResponseBuilder.bad(
						`The queue only has ${queue.length} songs, cannot skip ${count} songs`
					)
				)
			}

			service.queue = queue.slice(count - 1)
			if (service.queueLoop) {
				service.queue.push(...queue.slice(0, count - 1))
			}

			service.stopStatus = StopStatus.INTENTIONAL
			service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(
				ResponseBuilder.good(
					"Skipped the current song" +
						(count > 1 ? ` and ${count - 1} songs in the queue` : "")
				)
			)
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
		}
	}
}

export default file
