import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, MessageEmbed } from "discord.js"
import DurationHelper from "../utilities/DurationHelper"
import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"

const thumb = "🔘"
const track = "▬"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("now-playing")
		.setDescription("Shows what's currently playing, along with the time"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const service = helper.cache.service
			if (service.queue.length === 0) {
				return helper.respond("❌ I am not playing anything right now")
			}

			const song = service.queue[0]
			const state = helper.cache.service.player.state as AudioPlayerPlayingState | AudioPlayerPausedState

			const percent = state.playbackDuration / 1000 / song.duration * 100
			const index = percent === 100 ? 24 : Math.floor(percent / 4)
			const seekbar = track.repeat(index) + thumb + track.repeat(24 - index)

			helper.respond({
				embeds: [
					new MessageEmbed()
						.setTitle("Now Playing")
						.setThumbnail(song.cover)
						.addField(`**${song.title} - ${song.artiste}**`, `Requested by <@!${song.requester}>`)
						.addField(
							`\`${seekbar}\``,
							`\`${new DurationHelper(state.playbackDuration / 1000).format()} / ${new DurationHelper(song.duration).format()}\``
						)
						.setFooter(`Requested by @${member.displayName}`, helper.interaction.user.displayAvatarURL())
				]
			})
		}
		else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile