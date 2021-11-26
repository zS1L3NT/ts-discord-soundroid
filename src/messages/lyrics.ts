import { MessageEmbed } from "discord.js"
import { useTryAsync } from "no-try"
import { iMessageFile } from "../utilities/BotSetupHelper"
import DominantColorGetter from "../utilities/DominantColorGetter"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

module.exports = {
	condition: helper => helper.matchMore(`\\${helper.cache.getPrefix()}lyrics`),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				),
				5000
			)
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue
			if (queue.length === 0) {
				helper.reactFailure()
				return helper.respond(
					new EmbedResponse(Emoji.BAD, "I am not playing anything right now"),
					5000
				)
			}

			const query = helper.input()!.join(" ")
			const song = queue[0]

			const [err, lyrics] = await useTryAsync(() => {
				return helper.cache.apiHelper.findGeniusLyrics(
					query || `${song.title} ${song.artiste}`
				)
			})

			if (err) {
				helper.reactFailure()
				if (query) {
					return helper.respond(
						new EmbedResponse(
							Emoji.BAD,
							"Sorry, couldn't find any lyrics for this search query\n" +
								"Was your query too specific? Try using a shorter query"
						),
						8000
					)
				} else {
					return helper.respond(
						new EmbedResponse(
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
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
