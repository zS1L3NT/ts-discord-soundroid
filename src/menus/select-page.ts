import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import PageSelectFormatter from "../utilities/PageSelectFormatter"
import QueueFormatter from "../utilities/QueueFormatter"
import { GuildMember, Message, TextChannel } from "discord.js"
import { iMenuFile } from "../utilities/BotSetupHelper"
import { useTryAsync } from "no-try"

const file: iMenuFile = {
	defer: false,
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
			return helper.update(
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
		helper.update(new EmbedResponse(Emoji.GOOD, `Changed to page ${page}`))
	}
}

module.exports = file
