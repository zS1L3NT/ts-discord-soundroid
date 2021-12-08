import DominantColorGetter from "../utilities/DominantColorGetter"
import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iInteractionFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, MessageEmbed } from "discord.js"
import { useTryAsync } from "no-try"

const file: iInteractionFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "lyrics",
		description: {
			slash: "Shows the lyrics for a song",
			help: [
				"Shows the lyrics for the current song",
				"If `query` given, searches the lyrics of the query instead"
			].join("\n")
		},
		options: [
			{
				name: "query",
				description: {
					slash: "Query for the lyrics",
					help: "The query for the lyrics"
				},
				type: "string",
				requirements: "Text",
				required: false
			}
		]
	},
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
			const queue = service.queue
			if (queue.length === 0) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "I am not playing anything right now")
				)
			}

			const query = helper.string("query")
			const song = queue[0]

			const [err, lyrics] = await useTryAsync(() =>
				helper.cache.apiHelper.findGeniusLyrics(query || `${song.title} ${song.artiste}`)
			)

			if (err) {
				if (query) {
					return helper.respond(
						new ResponseBuilder(
							Emoji.BAD,
							"Sorry, couldn't find any lyrics for this search query\n" +
								"Was your query too specific? Try using a shorter query"
						)
					)
				} else {
					return helper.respond(
						new ResponseBuilder(
							Emoji.BAD,
							"Sorry, couldn't find any lyrics for this song\n" +
								"Try using this command with the **query** option to manually search the server for lyrics"
						)
					)
				}
			}

			helper.respond({
				embeds: [
					new MessageEmbed()
						.setTitle(`${song.title} - ${song.artiste}`)
						.setColor(await new DominantColorGetter(song.cover).getColor())
						.setThumbnail(song.cover)
						.setDescription(lyrics)
						.setFooter(
							`Requested by @${member.displayName}`,
							member.user.displayAvatarURL()
						)
				]
			})
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Showing lyrics"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

export default file
