import Document, { iValue } from "../models/Document"
import GuildCache from "../models/GuildCache"
import PageSelectBuilder from "../utilities/PageSelectBuilder"
import QueueBuilder from "../utilities/QueueBuilder"
import { Emoji, iMenuFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, Message, TextChannel } from "discord.js"
import { useTryAsync } from "no-try"

const file: iMenuFile<iValue, Document, GuildCache> = {
	defer: false,
	ephemeral: true,
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
				new ResponseBuilder(Emoji.BAD, "Channel with the message not found")
			)
		}

		const [message_err, message] = await useTryAsync<Message>(
			() => channel.messages.fetch(message_id) as Promise<Message>
		)

		if (message_err) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, "Queue message not found"))
		}

		if (page_str === "more") {
			return helper.update(
				new PageSelectBuilder(message.embeds[0], channel_id, message_id).build(more)
			)
		}

		message.edit(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build(
				page
			)
		)
		helper.update(new ResponseBuilder(Emoji.GOOD, `Changed to page ${page}`))
	}
}

export default file
