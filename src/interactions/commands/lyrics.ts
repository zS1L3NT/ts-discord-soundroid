import { MessageEmbed } from "discord.js"
import { BaseCommand, CommandHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasMusicServiceMiddleware from "../../middleware/HasMusicServiceMiddleware"
import IsInMyVoiceChannelMiddleware from "../../middleware/IsInMyVoiceChannelMiddleware"
import IsPlayingMiddleware from "../../middleware/IsPlayingMiddleware"
import DominantColorGetter from "../../utils/DominantColorGetter"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shows the lyrics for the current song"
	}

	override middleware = [
		new IsInMyVoiceChannelMiddleware(),
		new HasMusicServiceMiddleware(),
		new IsPlayingMiddleware()
	]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const service = helper.cache.service!
		const song = service.queue[0]!

		const { lyrics, url } = await helper.cache.apiHelper.findGeniusLyrics(song)

		helper.respond(
			{
				embeds: [
					new MessageEmbed()
						.setTitle(`Genius Lyrics for: ${song.title} - ${song.artiste}`)
						.setColor(await new DominantColorGetter(song.cover).getColor())
						.setThumbnail(song.cover)
						.setDescription(`${lyrics}\n\n> Lyrics from ${url}`)
						.setFooter({
							text: `Requested by @${helper.member.displayName}`,
							iconURL: helper.member.user.displayAvatarURL()
						})
				]
			},
			null
		)
	}
}
