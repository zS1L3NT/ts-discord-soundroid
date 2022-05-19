import { GuildMember, MessageEmbed } from "discord.js"
import { iSlashFile, ResponseBuilder } from "nova-bot"

import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import DominantColorGetter from "../../utils/DominantColorGetter"
import DurationHelper from "../../utils/DurationHelper"

const thumb = "🔘"
const track = "▬"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "now-playing",
		description: {
			slash: "Show the currently playing, along with the time",
			help: "Shows the currently playing song with a progressbar showing how far into the song you are"
		}
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				ResponseBuilder.bad(
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		const service = helper.cache.service
		if (service) {
			if (service.queue.length === 0) {
				return helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			}

			const song = service.queue[0]!
			const state = service.player.state as AudioPlayerPlayingState | AudioPlayerPausedState

			const percent = (state.playbackDuration / 1000 / song.duration) * 100
			const index = percent === 100 ? 24 : Math.floor(percent / 4)
			const seekbar = track.repeat(index) + thumb + track.repeat(24 - index)

			helper.respond({
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
			})
		} else {
			helper.respond(ResponseBuilder.bad("I am not currently in a voice channel"))
		}
	}
}

export default file
