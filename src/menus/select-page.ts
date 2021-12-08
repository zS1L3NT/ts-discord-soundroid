import Entry from "../models/Entry"
import GuildCache from "../models/GuildCache"
import PageSelectBuilder from "../utilities/PageSelectBuilder"
import QueueBuilder from "../utilities/QueueBuilder"
import { Emoji, iMenuFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, Message, TextChannel } from "discord.js"
import { useTryAsync } from "no-try"

const file: iMenuFile<Entry, GuildCache> = {
	defer: false,
	ephemeral: true,
	execute: async helper => {
		const [channelId, messageId, pageStr, moreStr] = helper.value()!.split("-")
		const guild = helper.cache.guild
		const more = +moreStr
		const page = +pageStr

		const [channelErr, channel] = await useTryAsync<TextChannel>(
			() => guild.channels.fetch(channelId) as Promise<TextChannel>
		)

		if (channelErr) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Channel with the message not found")
			)
		}

		const [messageErr, message] = await useTryAsync<Message>(
			() => channel.messages.fetch(messageId) as Promise<Message>
		)

		if (messageErr) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, "Queue message not found"))
		}

		if (pageStr === "more") {
			return helper.update(
				new PageSelectBuilder(message.embeds[0], channelId, messageId).build(more)
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
