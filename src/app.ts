import axios from "axios"
import BotCache from "./data/BotCache"
import colors from "colors"
import config from "./config.json"
import express from "express"
import fs from "fs/promises"
import GuildCache from "./data/GuildCache"
import NovaBot from "nova-bot"
import open from "open"
import path from "path"
import qs from "qs"
import Tracer from "tracer"
import { Intents } from "discord.js"
require("dotenv").config()

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

process.setUncaughtExceptionCaptureCallback(err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

const refresh_spotify = () => {
	const PORT = 4296
	const app = express()

	app.get("/", async (req, res) => {
		logger.info(`Got Spotify API Authorization token`)
		const code = req.query.code as string

		// Get spotify access token from authorization code
		const spotify_res = await axios.post(
			"https://accounts.spotify.com/api/token",
			qs.stringify({
				grant_type: "authorization_code",
				code,
				redirect_uri: "http://localhost:4296"
			}),
			{
				headers: {
					Authorization:
						"Basic " +
						Buffer.from(
							config.spotify.clientId + ":" + config.spotify.clientSecret
						).toString("base64"),
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}
		)

		// Replace old access token with new access token
		logger.info(`Got Spotify API Access token`)
		const config_path = path.join(__dirname, "./config.json")
		const config_data = await fs.readFile(config_path, "utf8")
		await fs.writeFile(
			config_path,
			config_data
				.replace(config.spotify.accessToken, spotify_res.data.access_token)
				.replace(config.spotify.refreshToken, spotify_res.data.refresh_token)
		)
		logger.info(`Replaced Spotify API Access token`)

		res.send("<script>window.close();</script>")
		server.close()

		// Start the bot
		start_bot()
	})

	const server = app.listen(PORT, async () => {
		logger.info(`Server running on port ${PORT}`)

		// Get spotify authorization code
		const spotify_url = new URL("https://accounts.spotify.com/authorize")
		spotify_url.searchParams.append("response_type", "code")
		spotify_url.searchParams.append("client_id", config.spotify.clientId)
		spotify_url.searchParams.append("redirect_uri", "http://localhost:4296")
		spotify_url.searchParams.append("scope", "user-read-private playlist-read-private")
		await open(spotify_url.href, { wait: true })
	})
}

const start_bot = () => {
	new NovaBot({
		name: "SounDroid#5566",
		intents: [
			Intents.FLAGS.GUILD_VOICE_STATES,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILDS
		],
		cwd: __dirname,
		config,
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
}

if (process.platform === "win32") {
	refresh_spotify()
}

if (process.platform === "linux") {
	start_bot()
}
