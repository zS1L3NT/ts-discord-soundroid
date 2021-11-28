import DominantColorGetter from "../utilities/DominantColorGetter"
import DurationHelper from "../utilities/DurationHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"
import { GuildMember, MessageEmbed } from "discord.js"
import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

const thumb = "🔘"
const track = "▬"

const file: iInteractionFile = {
	defer: true,
	help: {
		description:
			"Shows you the currently playing song with a progressbar showing how far into the song you are",
		params: []
	},
	builder: new SlashCommandBuilder()
		.setName("now-playing")
		.setDescription("Shows what's currently playing, along with the time"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
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
							member.user.displayAvatarURL()
						)
				]
			})
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "I am not currently in a voice channel"))
		}
	}
}

module.exports = file
