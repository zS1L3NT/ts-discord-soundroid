import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

const file: iInteractionFile = {
	builder: new SlashCommandBuilder()
		.setName("leave-cleanup")
		.setDescription("Clear all songs in the queue from users that have left the voice channel"),
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
			const members = member.voice.channel!.members
			const oldLength = helper.cache.service.queue.length
			helper.cache.service.queue = helper.cache.service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = helper.cache.service.queue.length
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(
					Emoji.GOOD,
					`Cleared ${oldLength - newLength} songs from the queue`
				)
			)
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
