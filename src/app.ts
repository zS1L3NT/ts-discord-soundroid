import "dotenv/config"

import { ActivityType, GatewayIntentBits } from "discord.js"
import http from "http"
import NovaBot from "nova-bot"
import path from "path"

import { Entry } from "@prisma/client"

import BotCache from "./data/BotCache"
import GuildCache from "./data/GuildCache"
import logger from "./logger"
import prisma from "./prisma"

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

class SounDroidBot extends NovaBot<typeof prisma, Entry, GuildCache, BotCache> {
	override name = "SounDroid#5566"
	override icon =
		"https://cdn.discordapp.com/avatars/899858077027811379/56e8665909db40439b09e13627970b62.png?size=128"
	override directory = path.join(__dirname, "interactions")
	override intents = [
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds
	]

	override helpMessage = (cache: GuildCache) =>
		[
			"Welcome to SounDroid!",
			"SounDroid is a Music bot which plays songs from Spotify and YouTube",
			cache.prefix
				? `My prefix for message commands is \`${cache.prefix}\``
				: `No message command prefix for this server`
		].join("\n")

	override GuildCache = GuildCache
	override BotCache = BotCache

	//@ts-ignore
	override logger = logger

	override prisma = prisma

	override onSetup(botCache: BotCache) {
		botCache.bot.user!.setPresence({
			activities: [
				{
					name: "/help",
					type: ActivityType.Listening
				}
			]
		})

		for (const guild of botCache.bot.guilds.cache.toJSON()) {
			guild.members.me!.setNickname("SounDroid")
		}
	}
}

new SounDroidBot().start()

const PORT = process.env.PORT || 8080
http.createServer((_, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" })
	res.write("SounDroid running!")
	res.end()
}).listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
