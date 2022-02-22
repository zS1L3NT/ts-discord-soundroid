import DominantColorGetter from "../../utilities/DominantColorGetter"
import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iSelectMenuFile, ResponseBuilder } from "nova-bot"
import { GuildMember, Message, MessageEmbed } from "discord.js"

const file: iSelectMenuFile<Entry, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		const member = helper.interaction.member as GuildMember

		try {
			const { title, artiste, cover, lyrics } = await helper.cache.apiHelper.findGeniusLyrics(
				helper.value()!
			)
			helper.interaction.update({
				embeds: [
					new MessageEmbed()
						.setTitle(`Genius Lyrics for: ${title} - ${artiste}`)
						.setColor(await new DominantColorGetter(cover).getColor())
						.setThumbnail(cover)
						.setDescription(lyrics)
						.setFooter({
							text: `Requested by @${member.displayName}`,
							iconURL: member.user.displayAvatarURL()
						})
				],
				components: []
			})
		} catch (err) {
			logger.error(err)
			helper.interaction.update({
				embeds: [
					new ResponseBuilder(
						Emoji.BAD,
						"Failed to retrieve lyrics from Genius API"
					).build()
				],
				components: []
			})
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
