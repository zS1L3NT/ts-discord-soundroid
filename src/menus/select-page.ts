import { GuildMember, Message, TextChannel } from "discord.js"
import { useTryAsync } from "no-try"
import { iMenuFile } from "../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import PageSelectFormatter from "../utilities/PageSelectFormatter"
import QueueFormatter from "../utilities/QueueFormatter"

module.exports = {
	id: "select-page",
	execute: async helper => {
		const [channel_id, message_id, page_str, more_str] = helper.value()!.split("-")
		const guild = helper.cache.guild
		const more = +more_str
		const page = +page_str

		const [channel_err, channel] = await useTryAsync<TextChannel>(
			() => guild.channels.fetch(channel_id) as Promise<TextChannel>
		)

		if (channel_err) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Channel with the message not found")
			)
		}

		const [message_err, message] = await useTryAsync<Message>(
			() => channel.messages.fetch(message_id) as Promise<Message>
		)

		if (message_err) {
			return helper.respond(new EmbedResponse(Emoji.BAD, "Queue message not found"))
		}

		if (page_str === "more") {
			return helper.respond(
				new PageSelectFormatter(
					message.embeds[0],
					channel_id,
					message_id
				).getMessagePayload(more)
			)
		}

		message.edit(
			await new QueueFormatter(
				helper.cache,
				helper.interaction.member as GuildMember
			).getMessagePayload(page)
		)

		helper.respond(new EmbedResponse(Emoji.GOOD, `Showing page ${page} of the queue`))
	}
} as iMenuFile