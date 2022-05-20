import { GuildMember, Message, MessageEmbed } from "discord.js"
import { useTryAsync } from "no-try"
import { BaseSelectMenu, ResponseBuilder, SelectMenuHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"
import DominantColorGetter from "../../utils/DominantColorGetter"

export default class extends BaseSelectMenu<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override async execute(helper: SelectMenuHelper<Entry, GuildCache>) {
		const member = helper.interaction.member as GuildMember

		await helper.interaction.update({
			embeds: [
				new MessageEmbed()
					.setTitle("Genius Lyrics for: `<...>` - `<...>`")
					.setDescription("`<...>`")
					.setFooter({
						text: `Requested by @${member.displayName}`,
						iconURL: member.user.displayAvatarURL()
					})
			],
			components: []
		})

		const [, messageOptions] = await useTryAsync(async () => {
			try {
				const id = helper.value!
				const { title, artiste, cover, lyrics } =
					await helper.cache.apiHelper.findGeniusLyrics(id)
				return {
					embeds: [
						new MessageEmbed()
							.setTitle(`Genius Lyrics for: ${title} - ${artiste}`)
							.setColor(await new DominantColorGetter(cover).getColor())
							.setThumbnail(cover)
							.setDescription(
								`${lyrics}\n\n> Lyrics from https://genius.com/songs/${id}`
							)
							.setFooter({
								text: `Requested by @${member.displayName}`,
								iconURL: member.user.displayAvatarURL()
							})
					],
					components: []
				}
			} catch (err) {
				logger.error(err)
				return {
					embeds: [
						ResponseBuilder.bad("Failed to retrieve lyrics from Genius API").build()
					],
					components: []
				}
			}
		})

		if (helper.interaction.message.type === "APPLICATION_COMMAND") {
			await helper.interaction.editReply(messageOptions)
		} else {
			const message = helper.interaction.message as Message
			await message.edit(messageOptions)
		}
	}
}
