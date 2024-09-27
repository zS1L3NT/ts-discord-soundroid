import { BaseSelectMenu, ResponseBuilder, type SelectMenuHelper, tryasync } from "@framework"
import type { Message, TextChannel } from "discord.js"

import PageSelectBuilder from "../../builders/page-select-builder"
import QueueBuilder from "../../builders/queue-builder"

export default class extends BaseSelectMenu {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: SelectMenuHelper) {
		const [channelId, messageId, pageStr, moreStr] = helper.value!.split("-")
		const guild = helper.cache.guild
		const more = +moreStr!
		const page = +pageStr!

		const [channel, cerror] = await tryasync<TextChannel>(
			() => guild.channels.fetch(channelId!) as Promise<TextChannel>,
		)

		if (cerror) {
			return helper.respond(ResponseBuilder.bad("Channel with the message not found"))
		}

		const [message, merror] = await tryasync<Message>(
			() => channel.messages.fetch(messageId!) as Promise<Message>,
		)

		if (merror || message?.embeds.length === 0) {
			return helper.respond(ResponseBuilder.bad("Queue message not found"))
		}

		if (pageStr === "more") {
			return helper.update(
				new PageSelectBuilder(message.embeds[0]!, channelId!, messageId!).build(more),
			)
		}

		message.edit(await new QueueBuilder(helper.cache, helper.member).build(page))
		helper.update(ResponseBuilder.good(`Changed to page ${page}`))
	}
}
