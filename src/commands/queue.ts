import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show the queue of songs playing"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond({
				emoji: Emoji.BAD,
				message: "You have to be in a voice channel to use this command"
			})
		}

		helper.interaction.channel!.send(await new QueueFormatter(helper.cache, helper.interaction).getMessagePayload())
		helper.respond({
			emoji: Emoji.GOOD,
			message: "Showing queue"
		})
	}
} as iInteractionFile