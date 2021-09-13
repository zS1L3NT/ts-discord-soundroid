import {Client, Intents} from "discord.js"
import BotSetupHelper from "./utilities/BotSetupHelper"

const config = require("../config.json")

// region Initialize bot
const bot = new Client({
	intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
})
const botSetupHelper = new BotSetupHelper(bot)
// endregion

void bot.login(config.discord.token)
bot.on("ready", async () => {
	console.log("Logged in as SounDroid Bot#5566")

	let i = 0
	let count = bot.guilds.cache.size
	for (const guild of bot.guilds.cache.toJSON()) {
		const tag = `${(++i).toString().padStart(count.toString().length, "0")}/${count}`

		try {
			await botSetupHelper.deploySlashCommands(guild)
		} catch (err) {
			console.error(`${tag} ❌ Couldn't get Slash Command permission for Guild(${guild.name})`)
			guild.leave()
			continue
		}

		console.log(`${tag} ✅ Updated slash commands for Guild(${guild.name})`)
	}
	console.log(`✅ Updated all slash commands`)
})
