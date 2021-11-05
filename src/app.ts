import AfterEvery from "after-every"
import { Client, Intents } from "discord.js"
import express from "express"
import open from "open"
import path from "path"
import qs from "qs"
import fs from "fs/promises"
import GuildCache from "./models/GuildCache"
import BotSetupHelper from "./utilities/BotSetupHelper"
import axios from "axios"
import SlashCommandDeployer from "./utilities/SlashCommandDeployer"

const config = require("../config.json")

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
	// region Initialize bot
	const bot = new Client({
		intents: [
			Intents.FLAGS.GUILD_VOICE_STATES,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILDS
		]
	})
	const botSetupHelper = new BotSetupHelper(bot)
	const { cache: botCache } = botSetupHelper
	// endregion

	void bot.login(config.discord.token)
	bot.on("ready", async () => {
		console.log("Logged in as SounDroid Bot#5566")

		let debugCount = 0

		let i = 0
		let count = bot.guilds.cache.size
		for (const guild of bot.guilds.cache.toJSON()) {
			const tag = `${(++i).toString().padStart(count.toString().length, "0")}/${count}`
			let cache: GuildCache | undefined
			try {
				cache = await botCache.getGuildCache(guild)
			} catch (err) {
				console.error(
					`${tag} ❌ Couldn't find a Firebase Document for Guild(${guild.name})`
				)
				guild.leave()
				continue
			}

			try {
				await new SlashCommandDeployer(guild.id, botSetupHelper.interactionFiles).deploy()
			} catch (err) {
				console.error(
					`${tag} ❌ Couldn't get Slash Command permission for Guild(${guild.name})`
				)
				guild.leave()
				continue
			}

			cache.updateMinutely(debugCount)
			guild.me?.setNickname("SounDroid Bot")

			console.log(`${tag} ✅ Restored cache for Guild(${guild.name})`)
		}
		console.log(`✅ All bot cache restored`)
		console.log("|")

		AfterEvery(1).minutes(async () => {
			debugCount++
			for (const guild of bot.guilds.cache.toJSON()) {
				const cache = await botCache.getGuildCache(guild)
				cache.updateMinutely(debugCount)
			}
		})
	})
}

if (process.platform === "win32") {
	refresh_spotify()
}

if (process.platform === "linux") {
	start_bot()
}