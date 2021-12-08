import Document, { iValue } from "../models/Document"
import DominantColorGetter from "../utilities/DominantColorGetter"
import DurationHelper from "../utilities/DurationHelper"
import GuildCache from "../models/GuildCache"
import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"
import { Emoji, iMessageFile, ResponseBuilder } from "discordjs-nova"
import { MessageEmbed } from "discord.js"

const thumb = "🔘"
const track = "▬"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}now-playing`),
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
			if (service.queue.length === 0) {
				helper.reactFailure()
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "I am not playing anything right now"),
					5000
				)
			}

			const song = service.queue[0]
			const state = service.player.state as AudioPlayerPlayingState | AudioPlayerPausedState

			const percent = (state.playbackDuration / 1000 / song.duration) * 100
			const index = percent === 100 ? 24 : Math.floor(percent / 4)
			const seekbar = track.repeat(index) + thumb + track.repeat(24 - index)

			helper.reactSuccess()
			helper.respond(
				{
					embeds: [
						new MessageEmbed()
							.setTitle("Now Playing")
							.setThumbnail(song.cover)
							.setColor(await new DominantColorGetter(song.cover).getColor())
							.addField(
								`**${song.title} - ${song.artiste}**`,
								`Requested by <@!${song.requester}>`
							)
							.addField(
								`\`${seekbar}\``,
								`\`${new DurationHelper(
									state.playbackDuration / 1000
								).format()} / ${new DurationHelper(song.duration).format()}\``
							)
							.setFooter(
								`Requested by @${member.displayName}`,
								member.user.displayAvatarURL()
							)
					]
				},
				10000
			)
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
