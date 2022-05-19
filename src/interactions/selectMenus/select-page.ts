import { GuildMember, Message, TextChannel } from "discord.js"
import { useTryAsync } from "no-try"
import { iSelectMenuFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import PageSelectBuilder from "../../utils/PageSelectBuilder"
import QueueBuilder from "../../utils/QueueBuilder"

const file: iSelectMenuFile<Entry, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		const [channelId, messageId, pageStr, moreStr] = helper.value()!.split("-")
		const guild = helper.cache.guild
		const more = +moreStr!
		const page = +pageStr!

		const [channelErr, channel] = await useTryAsync<TextChannel>(
			() => guild.channels.fetch(channelId!) as Promise<TextChannel>
		)

		if (channelErr) {
			return helper.respond(ResponseBuilder.bad("Channel with the message not found"))
		}

		const [messageErr, message] = await useTryAsync<Message>(
			() => channel.messages.fetch(messageId!) as Promise<Message>
		)

		if (messageErr || message.embeds.length === 0) {
			return helper.respond(ResponseBuilder.bad("Queue message not found"))
		}

		if (pageStr === "more") {
			return helper.update(
				new PageSelectBuilder(message.embeds[0]!, channelId!, messageId!).build(more)
			)
		}

		message.edit(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build(
				page
			)
		)
		helper.update(ResponseBuilder.good(`Changed to page ${page}`))
	}
}

export default file
