import { SlashCommandBuilder } from "@discordjs/builders"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { GuildMember, VoiceChannel } from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leave-cleanup")
		.setDescription("Clear all songs in the queue from users that have left the voice channel"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const members = member.voice.channel.members
			const oldLength = helper.cache.service.queue.length
			helper.cache.service.queue = helper.cache.service.queue.filter(
				(song, i) => i === 0 || !!members.get(song.requester)
			)
			const newLength = helper.cache.service.queue.length
			helper.respond(`✅ Cleared ${oldLength - newLength} songs from the queue`)
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile