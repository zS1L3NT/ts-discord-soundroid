import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"
import { GuildMember, TextChannel } from "discord.js"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile = {
	builder: new SlashCommandSubcommandBuilder()
		.setName("music-channel")
		.setDescription("Set the channel where the bot sends information of playing songs")
		.addChannelOption(option =>
			option.setName("channel").setDescription("Leave empty to unset the music channel")
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Only administrators can set bot channels")
			)
		}

		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			if (channel.id === helper.cache.getMusicChannelId()) {
				helper.respond(
					new EmbedResponse(Emoji.BAD, "This channel is already the Music channel!")
				)
			} else {
				await helper.cache.setMusicChannelId(channel.id)
				helper.cache.updateMusicChannel()
				helper.respond(
					new EmbedResponse(
						Emoji.GOOD,
						`Music channel reassigned to ${channel.toString()}`
					)
				)
			}
		} else if (channel === null) {
			await helper.cache.setMusicChannelId("")
			helper.respond(new EmbedResponse(Emoji.GOOD, `Music channel unassigned`))
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, `Please select a text channel`))
		}
	}
}

module.exports = file
