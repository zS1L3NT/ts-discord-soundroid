import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import Song from "../../data/Song"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iSelectMenuFile, ResponseBuilder } from "nova-bot"
import { GuildMember, VoiceChannel } from "discord.js"

const file: iSelectMenuFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.update(
				new ResponseBuilder(
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
				new ResponseBuilder(Emoji.GOOD, `Enqueued song: "${song.title} - ${song.artiste}"`)
			)
		} catch {
			helper.respond(new ResponseBuilder(Emoji.BAD, "Error playing song from url"))
		}
	}
}

export default file