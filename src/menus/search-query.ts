import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import MusicService from "../models/MusicService"
import Song from "../models/Song"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { GuildMember, VoiceChannel } from "discord.js"
import { iMenuFile } from "../utilities/BotSetupHelper"

const file: iMenuFile = {
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond(
				new EmbedResponse(
					Emoji.BAD,
					"You have to be in a voice channel to use this command"
				)
			)
		}

		const url = helper.value()!
		if (!helper.cache.service) {
			helper.cache.service = new MusicService(
				joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guild.id,
					adapterCreator: channel.guild
						.voiceAdapterCreator as DiscordGatewayAdapterCreator,
					selfDeaf: false
				}),
				helper.cache
			)
		}

		try {
			const song = await Song.from(helper.cache.apiHelper, url, member.id)
			helper.cache.service!.enqueue(song)
			helper.cache.updateMusicChannel()
			helper.respond(
				new EmbedResponse(Emoji.GOOD, `Enqueued song: "${song.title} - ${song.artiste}"`)
			)
		} catch {
			helper.respond(new EmbedResponse(Emoji.BAD, "Error playing song from url"))
		}
	}
}

module.exports = file
