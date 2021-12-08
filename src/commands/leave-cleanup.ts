import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		description: [
			"Removes all songs in the queue that were added by users who aren't currently in the voice channel",
			"Does not skip the currently playing song no matter who it was added by"
		].join("\n"),
		options: []
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

		const service = helper.cache.service
		if (service) {
			const members = member.voice.channel!.members
			const oldLength = service.queue.length
			service.queue = service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = service.queue.length
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

export default file
