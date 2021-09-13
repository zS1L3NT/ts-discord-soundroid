import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { Guild, GuildMember, MessageEmbed } from "discord.js"
import DurationHelper from "../utilities/DurationHelper"
import Song from "../models/Song"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show the queue of songs playing"),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (member.voice.channel === null) {
			return helper.respond("❌ You have to be in a voice channel to use this command")
		}

		if (helper.cache.service) {
			const queue = helper.cache.service.queue.slice(1)
			const embed = new MessageEmbed()
			const message: string[] = []

			embed.setTitle(`Queue for ${helper.interaction.guild!.name}`)
			embed.setColor("#0534D4")

			const currentSong = helper.cache.service.queue[0]
			message.push(`__Now Playing:__`)
			if (currentSong) {
				message.push(await song_format(helper.cache.guild, currentSong))
				embed.setThumbnail(currentSong.cover)
			}
			else {
				message.push(`Not playing anything at the moment`)
			}

			message.push(`\u200B`)

			if (queue.length > 0) {
				message.push(`__Queue:__`)
				for (const [i, song] of Object.entries(queue)) {
					message.push(`\`${parseInt(i) + 1}.\` ${await song_format(helper.cache.guild, song)}\n\u200B`)
				}
			}

			const playing_duration = helper.cache.service.queue.map(song => song.duration).reduce((t, d) => t + d)
			message.push(`**${queue.length} songs in queue | ${new DurationHelper(playing_duration).format()} total length**`)
			embed.addField(`Page`, `1/1`, true)
			embed.addField(`Loop`, helper.cache.service.loop ? "✅" : "❌", true)
			embed.addField(`Queue Loop`, helper.cache.service.queue_loop ? "✅" : "❌", true)

			embed.setDescription(message.join("\n"))
			embed.setFooter(`Requested by @${member.displayName}`, helper.interaction.user.displayAvatarURL())

			helper.respond({
				embeds: [embed]
			})
		}
		else {
			helper.respond("❌ I am not currently in a voice channel")
		}
	}
} as iInteractionFile

const song_format = async (guild: Guild, song: Song) => {
	const parts: string[] = []
	parts.push(`[${song.title} - ${song.artiste}](${song.url})`)
	parts.push(`|`)
	parts.push(`\`${new DurationHelper(song.duration).format()}\``)
	parts.push(`|`)
	parts.push(`Requested by <@!${song.requester}>`)
	return parts.join(" ")
}