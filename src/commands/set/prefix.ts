import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember } from "discord.js"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

const config = require("../../../config.json")

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("prefix")
		.setDescription("Change the prefix for message commands")
		.addStringOption(option =>
			option.setName("prefix").setDescription("Prefix to change to").setRequired(true)
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		const prefix = helper.string("prefix")!
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Only administrators can set the prefix")
			)
		}

		await helper.cache.ref.set({ prefix }, { merge: true })
		helper.respond(new EmbedResponse(Emoji.GOOD, `Prefix changed to \`${prefix}\``))
	}
} as iInteractionSubcommandFile
