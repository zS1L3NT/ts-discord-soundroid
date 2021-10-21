import { AudioPlayerPlayingState, AudioPlayerPausedState } from "@discordjs/voice"
import { MessageEmbed, VoiceChannel } from "discord.js"
import { iMessageFile } from "../utilities/BotSetupHelper"
import DominantColorGetter from "../utilities/DominantColorGetter"
import DurationHelper from "../utilities/DurationHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"

const thumb = "🔘"
const track = "▬"

module.exports = {
	condition: helper => helper.matchOnly(`\\${helper.cache.getPrefix()}now-playing`),
	execute: async helper => {
		const member = helper.message.member!
		if (!(member.voice.channel instanceof VoiceChannel)) {
			helper.reactFailure()
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				),
				5000
			)
		}

		if (helper.cache.service) {
			const service = helper.cache.service
			if (service.queue.length === 0) {
				helper.reactFailure()
				return helper.respond(
					new EmbedResponse(Emoji.BAD, "I am not playing anything right now"),
					5000
				)
			}

			const song = service.queue[0]
			const state = helper.cache.service.player.state as
				| AudioPlayerPlayingState
				| AudioPlayerPausedState

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
				new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
} as iMessageFile
