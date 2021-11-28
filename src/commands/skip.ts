import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: false,
	ephemeral: true,
	help: {
		description: "Skips songs in the queue as many times as specified",
		params: [
			{
				name: "count",
				description: "This is the number of times you want to skip the song",
				requirements: "Number",
				required: false,
				default: "1"
			}
		]
	},
	builder: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip current playing song and songs in queue")
		.addIntegerOption(option =>
			option
				.setName("count")
				.setDescription("Number of songs to skip. Defaults to 1 (only skip current song)")
				.setRequired(false)
		),
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

		if (helper.cache.service) {
			const count = helper.integer("count") || 1
			if (count < 1) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `Invalid skip count: ${count}`)
				)
			}

			const queue = [...helper.cache.service.queue]
			if (count >= queue.length && count > 1) {
				return helper.respond(
					new ResponseBuilder(
						Emoji.BAD,
						`The queue only has ${queue.length} songs, cannot skip ${count} songs`
					)
				)
			}

			helper.cache.service.queue = queue.slice(count - 1)
			if (helper.cache.service.queue_loop) {
				helper.cache.service.queue.push(...queue.slice(0, count - 1))
			}

			helper.cache.service.player.stop()
			helper.cache.updateMusicChannel()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					"Skipped the current song" +
						(count > 1 ? ` and ${count - 1} songs in the queue` : "")
				)
			)
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
