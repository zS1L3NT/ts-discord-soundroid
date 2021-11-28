import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: true,
	help: {
		description: "Move a song in the queue to a specified position",
		params: [
			{
				name: "from",
				description: "This is the song's position in the queue that you want to move",
				requirements: "Number that references a song in the queue",
				required: true
			},
			{
				name: "to",
				description: [
					"This is the position in the queue to move the song to",
					"Moves a song to the top of a queue if this isn't provided"
				].join("\n"),
				requirements: "Number that references a position in the queue",
				required: false,
				default: "1"
			}
		]
	},
	builder: new SlashCommandBuilder()
		.setName("move")
		.setDescription("Change a song's position in the queue")
		.addIntegerOption(option =>
			option
				.setName("from")
				.setDescription(
					'Position of the song to move. If "to" is not defined, moves this song to the top'
				)
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("to")
				.setDescription(
					"Position to move the song to. The song currently at this position will get pushed down"
				)
				.setRequired(false)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		if (helper.cache.service) {
			const from = helper.integer("from")!
			const to = helper.integer("to")

			const queue = helper.cache.service.queue
			const song = queue[from]

			if (from < 1 || from >= queue.length) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, `Invalid "from" position: ${from}`)
				)
			}

			if (to && (to < 1 || to > queue.length)) {
				return helper.respond(new EmbedResponse(Emoji.BAD, `Invalid "to" position: ${to}`))
			}

			queue.splice(to || 1, 0, ...queue.splice(from, 1))
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Moved "${song.title} - ${song.artiste}" from ${from} to ${
						to ?? `top of the queue`
					}`
				)
			)
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
