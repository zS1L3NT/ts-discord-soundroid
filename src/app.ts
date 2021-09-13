import {Client, Intents} from "discord.js"
import BotSetupHelper from "./utilities/BotSetupHelper"

const config = require("../config.json")

// region Initialize bot
const bot = new Client({
	intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
})
new BotSetupHelper(bot)
// endregion

void bot.login(config.discord.token)
bot.on("ready", async () => {
	console.log("Logged in as SounDroid Bot#5566")
})
