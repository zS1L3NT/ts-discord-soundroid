import { MessageEmbed } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { AudioPlayerPausedState, AudioPlayerPlayingState } from "@discordjs/voice"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInVoiceChannelMiddleware from "../../middleware/IsInVoiceChannelMiddleware"
import IsPlayingMiddleware from "../../middleware/IsPlayingMiddleware"
import DominantColorGetter from "../../utils/DominantColorGetter"
import DurationHelper from "../../utils/DurationHelper"

const thumb = "🔘"
const track = "▬"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "now-playing",
		description:
			"Shows the currently playing song with a progressbar showing how far into the song you are"
	}

	override middleware = [
		new IsInVoiceChannelMiddleware(),
		new HasMusicServiceMiddleware(),
		new IsPlayingMiddleware()
	]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(helper.cache.getPrefix(), "now-playing", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!

		const song = service.queue[0]
		const state = service.player.state as AudioPlayerPlayingState | AudioPlayerPausedState

		if (!song) {
			return helper.respond(ResponseBuilder.bad(`No song currently playing!`), 5000)
		}

		const percent = (state.playbackDuration / 1000 / song.duration) * 100
		const index = percent === 100 ? 24 : Math.floor(percent / 4)
		const seekbar = track.repeat(index) + thumb + track.repeat(24 - index)

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
							text: `Requested by @${helper.member.displayName}`,
							iconURL: helper.member.user.displayAvatarURL()
						})
				]
			},
			15_000
		)
	}
}
