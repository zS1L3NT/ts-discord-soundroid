import "dotenv/config"

import { Intents } from "discord.js"
import http from "http"
import NovaBot from "nova-bot"
import path from "path"

import BotCache from "./data/BotCache"
import GuildCache from "./data/GuildCache"
import logger from "./logger"

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

new NovaBot({
	name: "SounDroid#5566",
	intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
	directory: path.join(__dirname, "interactions"),
	//@ts-ignore
	logger,

	help: {
		message: cache =>
			[
				"Welcome to SounDroid!",
				"SounDroid is a Music bot which plays songs from Spotify and YouTube",
				cache.getPrefix()
					? `My prefix for message commands is \`${cache.getPrefix()}\``
					: `No message command prefix for this server`
			].join("\n"),
		icon: "https://cdn.discordapp.com/avatars/899858077027811379/56e8665909db40439b09e13627970b62.png?size=128"
	},

	GuildCache,
	BotCache,

	onSetup: botCache => {
		botCache.bot.user!.setPresence({
			activities: [
				{
					name: "/help",
					type: "LISTENING"
				}
			]
		})

		for (const guild of botCache.bot.guilds.cache.toJSON()) {
			guild.me?.setNickname("SounDroid")
		}
	}
})

const PORT = process.env.PORT || 8080
http.createServer((_, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" })
	res.write("SounDroid running!")
	res.end()
}).listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
