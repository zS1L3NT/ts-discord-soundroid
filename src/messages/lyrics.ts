import DominantColorGetter from "../utilities/DominantColorGetter"
import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import { MessageEmbed } from "discord.js"
import { useTryAsync } from "no-try"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}lyrics`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		const service = helper.cache.service
		if (service) {
			const queue = service.queue
			if (queue.length === 0) {
				helper.reactFailure()
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "I am not playing anything right now"),
					5000
				)
			}

			const query = helper.input()!.join(" ")
			const song = queue[0]

			if (!song) {
				helper.reactFailure()
				return helper.respond(new ResponseBuilder(Emoji.BAD, `No song currently playing!`))
			}

			const [err, lyrics] = await useTryAsync(() => {
				return helper.cache.apiHelper.findGeniusLyrics(
					query || `${song.title} ${song.artiste}`
				)
			})

			if (err) {
				helper.reactFailure()
				if (query) {
					return helper.respond(
						new ResponseBuilder(
							Emoji.BAD,
							"Sorry, couldn't find any lyrics for this search query\n" +
								"Was your query too specific? Try using a shorter query"
						),
						8000
					)
				} else {
					return helper.respond(
						new ResponseBuilder(
							Emoji.BAD,
							"Sorry, couldn't find any lyrics for this song\n" +
								"Try using this command with the **query** option to manually search the server for lyrics"
						),
						8000
					)
				}
			}

			helper.reactSuccess()
			helper.respond({
				embeds: [
					new MessageEmbed()
						.setTitle(query ? `Query: \`${query}\`` : `${song.title} - ${song.artiste}`)
						.setColor(await new DominantColorGetter(song.cover).getColor())
						.setThumbnail(song.cover)
						.setDescription(lyrics)
						.setFooter(
							`Requested by @${member.displayName}`,
							member.user.displayAvatarURL()
						)
				]
			})
		} else {
			helper.reactFailure()
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
