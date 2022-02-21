import DominantColorGetter from "../../utilities/DominantColorGetter"
import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import { Emoji, iSelectMenuFile, ResponseBuilder } from "nova-bot"
import { GuildMember, Message, MessageEmbed } from "discord.js"

const file: iSelectMenuFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const message = helper.interaction.message as Message
		const isEphemeral = message.type === "APPLICATION_COMMAND"

		try {
			const { title, artiste, cover, lyrics } = await helper.cache.apiHelper.findGeniusLyrics(
				helper.value()!
			)
			if (isEphemeral) {
				helper.respond({
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
					]
				})
			} else {
				message.delete().catch(err => logger.warn("Failed to delete message", err))
				helper.respond(new ResponseBuilder(Emoji.GOOD, "Showing lyrics"))
				helper.interaction.channel!.send({
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
					]
				})
			}
		} catch (err) {
			logger.error(err)
			if (isEphemeral) {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, "Failed to retrieve lyrics from Genius API")
				)
			} else {
				helper.interaction.channel!.send({
					embeds: [
						new ResponseBuilder(
							Emoji.BAD,
							"Failed to retrieve lyrics from Genius API"
						).build()
					]
				})
			}
		}
	}
}

export default file
