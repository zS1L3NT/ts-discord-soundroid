import BotCache from "../models/BotCache"
import ButtonHelper from "./ButtonHelper"
import EmbedResponse, { Emoji } from "./EmbedResponse"
import fs from "fs"
import InteractionHelper from "./InteractionHelper"
import MenuHelper from "./MenuHelper"
import MessageHelper from "./MessageHelper"
import path from "path"
import SlashCommandDeployer from "./SlashCommandDeployer"
import { Client, Collection } from "discord.js"
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { useTry } from "no-try"

export default class BotSetupHelper {
	public readonly botCache: BotCache
	public readonly interactionFiles: Collection<string, iInteractionFile | iInteractionFolder>
	public readonly buttonFiles: Collection<string, iButtonFile>
	public readonly menuFiles: Collection<string, iMenuFile>
	private readonly bot: Client
	private readonly messageFiles: iMessageFile[]

	constructor(bot: Client) {
		this.bot = bot
		this.botCache = new BotCache(this.bot)
		this.messageFiles = []
		this.interactionFiles = new Collection<string, iInteractionFile | iInteractionFolder>()
		this.buttonFiles = new Collection<string, iButtonFile>()
		this.menuFiles = new Collection<string, iMenuFile>()

		this.setupMessageCommands()
		this.setupInteractionCommands()
		this.setupButtonCommands()
		this.setupMenuCommands()

		this.bot.on("messageCreate", async message => {
			if (message.author.bot) return
			if (!message.guild) return
			const cache = await this.botCache.getGuildCache(message.guild!)

			const helper = new MessageHelper(cache, message)
			try {
				for (const messageFile of this.messageFiles) {
					if (messageFile.condition(helper)) {
						message.react("⌛").catch(() => {})
						await messageFile.execute(helper)
						break
					}
				}
			} catch (error) {
				console.error(error)
				helper.reactFailure()
				helper.respond(
					new EmbedResponse(Emoji.BAD, "There was an error while executing this command!")
				)
			}
		})

		this.bot.on("interactionCreate", async interaction => {
			if (!interaction.guild) return
			const cache = await this.botCache.getGuildCache(interaction.guild!)

			if (interaction.isCommand()) {
				await interaction
					.deferReply({ ephemeral: true })
					.catch(() => console.error("Failed to defer interaction"))
				const interactionEntity = this.interactionFiles.get(interaction.commandName)
				if (!interactionEntity) return

				const helper = new InteractionHelper(cache, interaction)
				try {
					const interactionFile = interactionEntity as iInteractionFile
					if (interactionFile.execute) {
						await interactionFile.execute(helper)
					}

					const interactionFolder = interactionEntity as iInteractionFolder
					if (interactionFolder.files) {
						const subcommand = interaction.options.getSubcommand(true)
						const interactionFile = interactionFolder.files.get(subcommand)
						if (!interactionFile) return

						await interactionFile.execute(helper)
					}
				} catch (error) {
					console.error(error)
					helper.respond(
						new EmbedResponse(
							Emoji.BAD,
							"There was an error while executing this command!"
						)
					)
				}
			}

			if (interaction.isButton()) {
				await interaction
					.deferReply({ ephemeral: true })
					.catch(() => console.error("Failed to defer interaction"))
				const buttonFile = this.buttonFiles.get(interaction.customId)
				if (!buttonFile) return

				const helper = new ButtonHelper(cache, interaction)
				try {
					await buttonFile.execute(helper)
				} catch (error) {
					console.error(error)
					helper.respond(
						new EmbedResponse(
							Emoji.BAD,
							"There was an error while executing this command!"
						)
					)
				}
			}

			if (interaction.isSelectMenu()) {
				await interaction
					.deferReply({ ephemeral: true })
					.catch(() => console.error("Failed to defer interaction"))
				const menuFile = this.menuFiles.get(interaction.customId)
				if (!menuFile) return

				const helper = new MenuHelper(cache, interaction)
				try {
					await menuFile.execute(helper)
				} catch (error) {
					console.error(error)
					helper.respond(
						new EmbedResponse(
							Emoji.BAD,
							"There was an error while executing this command!"
						)
					)
				}
			}
		})

		this.bot.on("guildCreate", async guild => {
			console.log(`Added to Guild(${guild.name})`)
			await this.botCache.createGuildCache(guild)
			await new SlashCommandDeployer(guild.id, this.interactionFiles).deploy()
		})

		this.bot.on("guildDelete", async guild => {
			console.log(`Removed from Guild(${guild.name})`)
			await this.botCache.deleteGuildCache(guild.id)
		})
	}

	private static isFile(file: string): boolean {
		return file.endsWith(".ts") || file.endsWith(".js")
	}

	private setupMessageCommands() {
		const [err, fileNames] = useTry(() => fs.readdirSync(path.join(__dirname, "../messages")))

		if (err) return

		for (const fileName of fileNames) {
			const file = require(`../messages/${fileName}`) as iMessageFile
			this.messageFiles.push(file)
		}
	}

	private setupInteractionCommands() {
		const [err, entitiyNames] = useTry(() =>
			fs.readdirSync(path.join(__dirname, "../commands"))
		)

		if (err) return

		// Slash subcommands
		const folderNames = entitiyNames.filter(f => !BotSetupHelper.isFile(f))
		for (const folderName of folderNames) {
			const fileNames = fs.readdirSync(path.join(__dirname, `../commands/${folderName}`))
			const builder = new SlashCommandBuilder()
				.setName(folderName)
				.setDescription(`Commands for ${folderName}`)

			const files: Collection<string, iInteractionSubcommandFile> = new Collection()
			for (const fileName of fileNames) {
				const file =
					require(`../commands/${folderName}/${fileName}`) as iInteractionSubcommandFile
				files.set(file.builder.name, file)
				builder.addSubcommand(file.builder)
			}

			this.interactionFiles.set(folderName, {
				builder,
				files
			})
		}

		// Slash commands
		const fileNames = entitiyNames.filter(f => BotSetupHelper.isFile(f))
		for (const filename of fileNames) {
			const file = require(`../commands/${filename}`) as iInteractionFile
			this.interactionFiles.set(file.builder.name, file)
		}
	}

	private setupButtonCommands() {
		const [err, fileNames] = useTry(() => fs.readdirSync(path.join(__dirname, "../buttons")))

		if (err) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]
			const file = require(`../buttons/${fileName}`) as iButtonFile
			this.buttonFiles.set(name, file)
		}
	}

	private setupMenuCommands() {
		const [err, fileNames] = useTry(() => fs.readdirSync(path.join(__dirname, "../menus")))

		if (err) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]
			const file = require(`../menus/${fileName}`) as iMenuFile
			this.menuFiles.set(name, file)
		}
	}
}

export interface iMessageFile {
	condition: (helper: MessageHelper) => boolean
	execute: (helper: MessageHelper) => Promise<void>
}

export interface iInteractionFile {
	builder: SlashCommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
}

export interface iInteractionSubcommandFile {
	builder: SlashCommandSubcommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
}

export interface iInteractionFolder {
	builder: SlashCommandBuilder
	files: Collection<string, iInteractionSubcommandFile>
}

export interface iButtonFile {
	execute: (helper: ButtonHelper) => Promise<any>
}

export interface iMenuFile {
	execute: (helper: MenuHelper) => Promise<any>
}
