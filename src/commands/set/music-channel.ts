import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, TextChannel } from "discord.js"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Sets the channel which the bot will attatch to and show the current playing song and queue",
			"This channel will be owned by the bot and unrelated messages will be cleared every minute",
			"Use this so you don't need to keep refreshing the queue message"
		].join("\n"),
		params: [
			{
				name: "channel",
				description: [
					"The channel which you would want to set as the music channel",
					"Leave this empty to unset the music channel"
				].join("\n"),
				requirements: "Text channel that isn't already the music channel",
				required: false
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("music-channel")
		.setDescription("Set the channel where the bot sends information of playing songs")
		.addChannelOption(option =>
			option.setName("channel").setDescription("Leave empty to unset the music channel").setRequired(false)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Only administrators can set bot channels")
			)
		}

		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			if (channel.id === helper.cache.getMusicChannelId()) {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, "This channel is already the Music channel!")
				)
			} else {
				await helper.cache.setMusicChannelId(channel.id)
				helper.cache.updateMusicChannel()
				helper.respond(
					new ResponseBuilder(Emoji.GOOD, `Music channel reassigned to ${channel.name}`)
				)
			}
		} else if (channel === null) {
			await helper.cache.setMusicChannelId("")
			helper.respond(new ResponseBuilder(Emoji.GOOD, `Music channel unassigned`))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, `Please select a text channel`))
		}
	}
}

export default file
