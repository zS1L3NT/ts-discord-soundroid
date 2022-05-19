import { GuildMember } from "discord.js"
import { iSlashFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "shuffle",
		description: {
			slash: "Shuffle the songs in the queue",
			help: "Shuffles the songs in the queue"
		}
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
			const queue = service.queue
			if (queue.length === 0) {
				return helper.respond(ResponseBuilder.bad("Cannot shuffle an empty queue"))
			}

			service.queue = [
				queue[0]!,
				...queue
					.slice(1)
					.map(value => ({ value, sort: Math.random() }))
					.sort((a, b) => a.sort - b.sort)
					.map(({ value }) => value)
			]
			helper.respond(ResponseBuilder.good("Shuffled Queue"))
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
		}
	}
}

export default file
