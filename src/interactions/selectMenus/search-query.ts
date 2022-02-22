import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import MusicService from "../../data/MusicService"
import Song from "../../data/Song"
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice"
import { Emoji, iSelectMenuFile, ResponseBuilder } from "nova-bot"
import { GuildMember, Message, VoiceChannel } from "discord.js"

const file: iSelectMenuFile<Entry, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel = member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			helper.interaction.update({
				embeds: [
					new ResponseBuilder(
						Emoji.BAD,
						"You have to be in a voice channel to use this command"
					).build()
				],
				components: []
			})
		} else {
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
				helper.interaction.update({
					embeds: [
						new ResponseBuilder(
							Emoji.GOOD,
							`Enqueued song: "${song.title} - ${song.artiste}"`
						).build()
					],
					components: []
				})
			} catch {
				helper.interaction.update({
					embeds: [new ResponseBuilder(Emoji.BAD, "Error playing song from url").build()],
					components: []
				})
			}
		}

		if (helper.interaction.message.type === "DEFAULT") {
			setTimeout(() => {
				const message = helper.interaction.message as Message
				message.delete().catch(err => logger.warn("Failed to delete message", err))
			}, 5000)
		}
	}
}

export default file
