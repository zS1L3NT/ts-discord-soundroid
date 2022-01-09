require("dotenv").config()
import axios from "axios"
import BotCache from "./models/BotCache"
import config from "./config.json"
import express from "express"
import fs from "fs/promises"
import GuildCache from "./models/GuildCache"
import NovaBot from "nova-bot"
import open from "open"
import path from "path"
import qs from "qs"
import { Intents } from "discord.js"

const refresh_spotify = () => {
	const PORT = 4296
	const app = express()

	app.get("/", async (req, res) => {
		console.log(`Got Spotify API Authorization token`)
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
		console.log(`Got Spotify API Access token`)
		const config_path = path.join(__dirname, "../config.json")
		const config_data = await fs.readFile(config_path, "utf8")
		await fs.writeFile(
			config_path,
			config_data
				.replace(config.spotify.accessToken, spotify_res.data.access_token)
				.replace(config.spotify.refreshToken, spotify_res.data.refresh_token)
		)
		console.log(`Replaced Spotify API Access token`)

		res.send("<script>window.close();</script>")
		server.close()

		// Start the bot
		start_bot()
	})

	const server = app.listen(PORT, async () => {
		console.log(`Server running on port ${PORT}`)

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
