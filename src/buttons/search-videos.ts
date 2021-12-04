import { GuildMember } from "discord.js"
import { Emoji, iButtonFile, ResponseBuilder } from "discordjs-nova"
import { useTry } from "no-try"
import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import SearchSelectBuilder from "../utilities/SearchSelectBuilder"

const file: iButtonFile<iValue, Document, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		const member = helper.interaction.member as GuildMember

		const [err, query] = useTry(() => {
			const embed = helper.interaction.message.embeds[0]
			const author = embed.author!.name
			const [, query] = author.match(/results for: "(.*)"$/)!
			return query
		})

		if (err) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Failed to get information about previous search")
			)
		}

		await helper.interaction.update(
			await new SearchSelectBuilder(helper.cache.apiHelper, query, member.id).buildVideo()
		)
	}
}

export default file