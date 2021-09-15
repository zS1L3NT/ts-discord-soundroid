import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, MessageEmbed, VoiceChannel } from "discord.js"
import DominantColorGetter from "../utilities/DominantColorGetter"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Shows the lyrics of the current song. If no **query** defined, searches lyrics for current song")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("Use this to manually search the server for song lyrics for the current song")
				.setRequired(false)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue
			if (queue.length === 0) {
				return helper.respond("❌ I am not playing anything right now")
			}

			const query = helper.string("query")
			const song = queue[0]

			let lyrics: string[]
			try {
				lyrics = await helper.cache.apiHelper.findGeniusLyrics(query || `${song.title} ${song.artiste}`)
			} catch {
				if (query) {
					return helper.respond(
						"❌ Sorry, couldn't find any lyrics for this search query\n" +
						"Was your query too specific? Try using a shorter query"
					)
				} else {
					return helper.respond(
						"❌ Sorry, couldn't find any lyrics for this song\n" +
						"Try using this command with the **query** option to manually search the server for lyrics"
					)
				}
			}

			helper.interaction.channel!.send({
				content: "\u200B",
				embeds: [
					new MessageEmbed()
						.setTitle(`${song.title} - ${song.artiste}`)
						.setColor(await new DominantColorGetter(song.cover).getColor())
						.setThumbnail(song.cover)
						.setDescription(lyrics.join("\n"))
						.setFooter(`Requested by @${member.displayName}`, helper.interaction.user.displayAvatarURL())
				]
			})
			helper.respond("✅ Showing lyrics")
		} else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile