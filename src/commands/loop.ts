import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Loop the current song in the queue, disables queue-loop mode"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"You have to be in a voice channel to use this command"
			))
		}

		if (helper.cache.service) {
			helper.cache.service.queue_loop = false
			if (helper.cache.service.loop) {
				helper.cache.service.loop = false
				helper.respond(new EmbedResponse(
					Emoji.GOOD,
					"Loop disabled"
				))
			}
			else {
				helper.cache.service.loop = true
				helper.respond(new EmbedResponse(
					Emoji.GOOD,
					"Loop enabled"
				))
			}
		}
		else {
			helper.respond(new EmbedResponse(
				Emoji.BAD,
				"I am not currently in a voice channel"
			))
		}
	}
} as iInteractionFile