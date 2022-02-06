import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import QueueBuilder from "../../utilities/QueueBuilder"
import { Emoji, iSlashFile, ResponseBuilder } from "nova-bot"
import { GuildMember } from "discord.js"

const file: iSlashFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "queue",
		description: {
			slash: "Show the queue of songs playing",
			help: [
				"Shows a detailed message about all the songs in the queue",
				"You are able to refresh the queue to see the up to date version of the queue",
				"You are able to change the page of the queue"
			].join("\n")
		}
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!helper.cache.isMemberInMyVoiceChannel(member)) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"You have to be in the same voice channel as me to use this command"
				)
			)
		}

		helper.interaction.channel!.send(
			await new QueueBuilder(helper.cache, helper.interaction.member as GuildMember).build()
		)
		helper.respond(new ResponseBuilder(Emoji.GOOD, "Showing queue"))
	}
}

export default file