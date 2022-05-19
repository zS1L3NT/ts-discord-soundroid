import { GuildMember } from "discord.js"
import { useTry } from "no-try"
import { BaseButton, ButtonHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import SearchSelectBuilder from "../../utils/SearchSelectBuilder"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		const member = helper.interaction.member as GuildMember

		const [err, query] = useTry(() => {
			const embed = helper.interaction.message.embeds[0]
			const author = embed!.author!.name
			const [, query] = author.match(/results for: "(.*)"$/)!
			return query
		})

		if (err) {
			return helper.respond(
				ResponseBuilder.bad("Failed to get information about previous search")
			)
		}

		await helper.interaction.update(
			await new SearchSelectBuilder(helper.cache.apiHelper, query!, member.id).buildMusic()
		)
	}
}
