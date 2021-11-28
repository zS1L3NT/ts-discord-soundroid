import ResponseBuilder, { Emoji } from "../utilities/ResponseBuilder"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile = {
	defer: true,
	help: {
		description: [
			"Removes all songs in the queue that were added by users who aren't currently in the voice channel",
			"Does not skip the currently playing song no matter who it was added by"
		].join("\n"),
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("leave-cleanup")
		.setDescription("Clear all songs in the queue from users that have left the voice channel"),
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
			const members = member.voice.channel!.members
			const oldLength = helper.cache.service.queue.length
			helper.cache.service.queue = helper.cache.service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = helper.cache.service.queue.length
			helper.cache.updateMusicChannel()
			helper.respond(
				new ResponseBuilder(
					Emoji.GOOD,
					`Cleared ${oldLength - newLength} songs from the queue`
				)
			)
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
