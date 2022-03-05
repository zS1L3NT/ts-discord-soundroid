import BotCache from "./data/BotCache"
import colors from "colors"
import dotenv from "dotenv"
import GuildCache from "./data/GuildCache"
import NovaBot from "nova-bot"
import path from "path"
import Tracer from "tracer"
import { Intents } from "discord.js"

dotenv.config()

/**
 * log: Used for basic primitive information
 * debug: Only used for debugging if not don't use this
 * info: Used for general information
 * alert: Used for possible minor problems or user erros
 * warn: Used for caught errors which need attention
 * error: Used for errors that are not fixed
 */
global.logger = Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] <{{path}}> {{message}}",
		{
			//@ts-ignore
			alert: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			warn: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			error: "[{{timestamp}}] <{{path}}, Line {{line}} at {{pos}}> {{message}}"
		}
	],
	methods: ["log", "discord", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		//@ts-ignore
		discord: colors.cyan,
		debug: colors.blue,
		info: colors.green,
		//@ts-ignore
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic
	},
	preprocess: data => {
		data.path = data.path
			.split("nova-bot")
			.at(-1)!
			.replace(/^(\/|\\)dist/, "nova-bot")
			.replaceAll("\\", "/")
		data.path = data.path
			.split("ts-discord-soundroid")
			.at(-1)!
			.replace(/^(\/|\\)(dist|src)/, "src")
			.replaceAll("\\", "/")
	}
})

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

new NovaBot({
	name: "SounDroid#5566",
	intents: [
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILDS
	],
	directory: path.join(__dirname, "interactions"),
	config: {
		firebase: {
			service_account: {
				projectId: process.env.FIREBASE__SERVICE_ACCOUNT__PROJECT_ID,
				privateKey: process.env.FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY,
				clientEmail: process.env.FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL,
			},
			collection: process.env.FIREBASE__COLLECTION,
			database_url: process.env.FIREBASE__DATABASE_URL
		},
		discord: {
			token: process.env.DISCORD__TOKEN,
			dev_id: process.env.DISCORD__DEV_ID,
			bot_id: process.env.DISCORD__BOT_ID,
		}
	},
	updatesMinutely: true,
	//@ts-ignore
	logger: global.logger,

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
