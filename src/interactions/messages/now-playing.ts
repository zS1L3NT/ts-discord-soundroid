import DominantColorGetter from "../../utilities/DominantColorGetter"
import DurationHelper from "../../utilities/DurationHelper"
import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"
import { Emoji, iMessageFile, ResponseBuilder } from "nova-bot"
import { MessageEmbed } from "discord.js"

const thumb = "🔘"
const track = "▬"

const file: iMessageFile<Entry, GuildCache> = {
	condition: helper => helper.isMessageCommand(helper.cache.getPrefix(), "now-playing", "only"),
	execute: async helper => {
		const member = helper.message.member!
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
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
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "I am not playing anything right now"),
					5000
				)
			}

			const song = service.queue[0]
			const state = service.player.state as AudioPlayerPlayingState | AudioPlayerPausedState

			if (!song) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, `No song currently playing!`),
					5000
				)
			}

			const percent = (state.playbackDuration / 1000 / song.duration) * 100
			const index = percent === 100 ? 24 : Math.floor(percent / 4)
			const seekbar = track.repeat(index) + thumb + track.repeat(24 - index)

			helper.reactSuccess()
			helper.clearAfter(5000)
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
							.setFooter({
								text: `Requested by @${member.displayName}`,
								iconURL: member.user.displayAvatarURL()
							})
					]
				},
				15_000
			)
		} else {
			helper.respond(
				new ResponseBuilder(Emoji.BAD, "I am not currently in a voice channel"),
				5000
			)
		}
	}
}

export default file
