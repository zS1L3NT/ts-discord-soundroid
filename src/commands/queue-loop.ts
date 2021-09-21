import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse from "../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue-loop")
		.setDescription("Loop the current queue, disables loop mode"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		if (helper.cache.service) {
			helper.cache.service.loop = false
			if (helper.cache.service.queue_loop) {
				helper.cache.service.queue_loop = false
				helper.respond(new EmbedResponse(Emoji.GOOD, "Queue Loop disabled"))
			} else {
				helper.cache.service.queue_loop = true
				helper.respond(new EmbedResponse(Emoji.GOOD, "Queue Loop enabled"))
			}
			helper.cache.updateMusicChannel()
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
} as iInteractionFile
