import { SlashCommandBuilder } from "@discordjs/builders"
import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"
import { GuildMember, MessageEmbed, VoiceChannel } from "discord.js"
import { Emoji, iInteractionFile } from "../utilities/BotSetupHelper"
import DominantColorGetter from "../utilities/DominantColorGetter"
import DurationHelper from "../utilities/DurationHelper"
import EmbedResponse from "../utilities/EmbedResponse"

const thumb = "🔘"
const track = "▬"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("now-playing")
		.setDescription("Shows what's currently playing, along with the time"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!(member.voice.channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		if (helper.cache.service) {
			const service = helper.cache.service
			if (service.queue.length === 0) {
				return helper.respond(
					new EmbedResponse(Emoji.BAD, "I am not playing anything right now")
				)
			}

			const song = service.queue[0]
			const state = helper.cache.service.player.state as
				| AudioPlayerPlayingState
				| AudioPlayerPausedState

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
						.setFooter(
							`Requested by @${member.displayName}`,
							helper.interaction.user.displayAvatarURL()
						)
				]
			})
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
} as iInteractionFile
