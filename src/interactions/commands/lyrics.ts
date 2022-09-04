import { Colors, EmbedBuilder } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"
import DominantColorGetter from "../../utils/DominantColorGetter"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: [
			"Shows the lyrics for the current song",
			"If `query` given, searches the lyrics of the query instead"
		].join("\n"),
		options: [
			{
				name: "query",
				description: "The query for the lyrics",
				type: "string" as const,
				requirements: "Text",
				required: false
			}
		]
	}

	override middleware = []

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return {
			query: helper.args().join(" ")
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const query = helper.string("query")
		const service = helper.cache.service

		if (service) {
			if (service.queue.length === 0 && !query) {
				return helper.respond(ResponseBuilder.bad("I am not playing anything right now"))
			}

			const song = service.queue[0]!
			helper.cache.apiHelper
				.findGeniusLyrics(`${song.title} ${song.artiste}`)
				.then(async ({ lyrics, url }) => {
					helper.respond(
						{
							embeds: [
								new EmbedBuilder()
									.setTitle(`Genius Lyrics for: ${song.title} - ${song.artiste}`)
									.setColor(await new DominantColorGetter(song.cover).getColor())
									.setThumbnail(song.cover)
									.setDescription(`${lyrics}\n\n> Lyrics from ${url}`)
									.setFooter({
										text: `Requested by @${helper.member.displayName}`,
										iconURL: helper.member.user.displayAvatarURL()
									})
							]
						},
						null
					)
				})
				.catch(err => {
					helper.respond(
						ResponseBuilder.bad(
							`Failed to get lyrics for: ${song.title} - ${song.artiste}`
						)
					)
					helper.cache.logger.log({
						member: helper.member,
						title: "Failed to get lyrics",
						description: [
							`**Song**: ${song.title} - ${song.artiste}`,
							err.stack || "No stack trace available"
						].join("\n"),
						command: "lyrics",
						color: Colors.Red
					})
				})
		} else {
			if (query) {
				helper.cache.apiHelper
					.findGeniusLyrics(query)
					.then(async ({ lyrics, url }) => {
						helper.respond(
							{
								embeds: [
									new EmbedBuilder()
										.setTitle(`Genius Lyrics for query: ${query}`)
										.setDescription(`${lyrics}\n\n> Lyrics from ${url}`)
										.setFooter({
											text: `Requested by @${helper.member.displayName}`,
											iconURL: helper.member.user.displayAvatarURL()
										})
								]
							},
							null
						)
					})
					.catch(err => {
						helper.respond(
							ResponseBuilder.bad(`Failed to get lyrics for query: ${query}`)
						)
						helper.cache.logger.log({
							member: helper.member,
							title: "Failed to get lyrics",
							description: [
								`**Query**: ${query}`,
								err.stack || "No stack trace available"
							].join("\n"),
							command: "lyrics",
							color: Colors.Red
						})
					})
			} else {
				helper.respond(
					ResponseBuilder.bad(
						"No song playing right now, please pass in a query to find lyrics"
					)
				)
			}
		}
	}
}
