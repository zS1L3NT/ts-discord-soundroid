import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { GuildMember, MessageActionRow, MessageSelectMenu, VoiceChannel } from "discord.js"
import MusicService from "../models/MusicService"
import { joinVoiceChannel } from "@discordjs/voice"
import Song from "../models/Song"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song from a url or search")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("Search query")
				.setRequired(true)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const channel =  member.voice.channel
		if (!(channel instanceof VoiceChannel)) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		const query = helper.string("query", true)!

		try {
			new URL(query)

			if (!helper.cache.service) {
				helper.cache.service = new MusicService(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator
					}),
					() => delete helper.cache.service
				)
			}

			try {
				const song = await Song.from(helper.cache.youtube, query, member.id)
				helper.cache.service!.enqueue(song)
				helper.respond("✅ Enqueued song")
			} catch {
				helper.respond("❌ Error playing song from url")
			}
		} catch {
			const results = await helper.cache.youtube.search(query, member.id)
			const emojis: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

			helper.respond({
				content: "📃 Choose a song from the search results below!",
				components: [
					new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId("search-query")
								.addOptions(results.map((result, i) => ({
									emoji: emojis[i],
									label: result.title,
									value: result.url,
									description: result.artiste
								})))
						)
				]
			})
		}
	}
} as iInteractionFile