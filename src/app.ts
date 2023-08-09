import { ActivityType, GatewayIntentBits } from "discord.js"
import NovaBot from "nova-bot"
import path from "path"

import { Entry } from "@prisma/client"

import BotCache from "./data/BotCache"
import GuildCache from "./data/GuildCache"
import logger from "./logger"
import prisma from "./prisma"

import "dotenv/config"

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

class SounDroidBot extends NovaBot<typeof prisma, Entry, GuildCache, BotCache> {
	override name = "SounDroid#9390"
	override icon = "https://res.cloudinary.com/zs1l3nt/image/upload/icons/soundroid.png"
	override directory = path.join(__dirname, "interactions")
	override intents = [
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	]

	override helpMessage = (cache: GuildCache) =>
		[
			"Welcome to SounDroid!",
			"SounDroid is a Music bot which plays songs from Spotify and YouTube",
			cache.prefix
				? `My prefix for message commands is \`${cache.prefix}\``
				: `No message command prefix for this server`,
		].join("\n")

	override GuildCache = GuildCache
	override BotCache = BotCache

	override logger = logger

	override prisma = prisma

	override onSetup(botCache: BotCache) {
		botCache.bot.user!.setPresence({
			activities: [
				{
					name: "/help",
					type: ActivityType.Listening,
				},
			],
		})

		for (const guild of botCache.bot.guilds.cache.toJSON()) {
			guild.members.me!.setNickname("SounDroid")
		}
	}
}

new SounDroidBot().start()
