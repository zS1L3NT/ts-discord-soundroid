import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, VoiceChannel } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import PlayRequest from "../utilities/PlayRequest"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song from a url or search")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription(
					"Can be a YouTube link, Spotify Song/Playlist link or a youtube search query"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		const query = helper.string("query")!
		await new PlayRequest(helper, query).run()
	}
} as iInteractionFile
