import fs from "fs"
import path from "path"
import {
	Collection,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageOptions,
	MessageSelectMenu
} from "discord.js"
import {
	iInteractionFile,
	iInteractionFolder,
	iInteractionHelp,
	iInteractionSubcommandFile
} from "./BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { useTry } from "no-try"
import GuildCache from "../models/GuildCache"

class HelpBuilder {
	private cache: GuildCache
	private readonly QUESTION =
		"https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/question.png?alt=media&token=fc6d0312-1ed2-408d-9309-5abe69c467c3"
	private readonly PROFILE =
		"https://cdn.discordapp.com/avatars/899858077027811379/56e8665909db40439b09e13627970b62.png?size=128"

	public constructor(cache: GuildCache) {
		this.cache = cache
	}

	public buildMaximum(): MessageOptions {
		const interactionFiles = this.getInteractionFiles()
		const embed = new MessageEmbed()
		const button = new MessageButton()
			.setCustomId("help-minimum")
			.setLabel("Minimise")
			.setStyle("PRIMARY")
			.setEmoji("➖")

		embed.setAuthor("Help", this.QUESTION)
		embed.setThumbnail(this.PROFILE)
		embed.setColor("#C7D1D8")
		embed.setDescription("Overview of all commands")

		for (const [entityName, entity] of interactionFiles) {
			if (Object.keys(entity).includes("files")) {
				for (const [fileName, file] of (entity as iInteractionFolder).files) {
					const name = `${entityName} ${fileName}`
					embed.addField(name, file.help.description)
				}
			} else {
				embed.addField(entityName, (entity as iInteractionFile).help.description)
			}
		}

		return {
			embeds: [embed],
			components: [
				new MessageActionRow().addComponents(this.createMenu()),
				new MessageActionRow().addComponents(button)
			]
		}
	}

	public buildMinimum(): MessageOptions {
		const embed = new MessageEmbed()
		const button = new MessageButton()
			.setCustomId("help-maximum")
			.setLabel("Maximise")
			.setStyle("PRIMARY")
			.setEmoji("➕")

		embed.setAuthor("Help", this.QUESTION)
		embed.setThumbnail(this.PROFILE)
		embed.setColor("#C7D1D8")
		embed.setDescription(
			[
				"Welcome to SounDroid!",
				"SounDroid is a Music bot which plays songs from Spotify and YouTube",
				`My prefix for message commands is \`${this.cache.getPrefix()}\``,
				"",
				"Click the button below to see all available commands",
				"Use the select menu below to find out more about a specific command"
			].join("\n")
		)

		return {
			embeds: [embed],
			components: [
				new MessageActionRow().addComponents(this.createMenu()),
				new MessageActionRow().addComponents(button)
			]
		}
	}

	public buildCommand(command: string): MessageOptions {
		const interactionFiles = this.getInteractionFiles()
		const embed = new MessageEmbed()
		const button = new MessageButton()
			.setCustomId("help-minimum")
			.setLabel("Back")
			.setStyle("PRIMARY")
			.setEmoji("⬅")

		const help: iInteractionHelp = command.includes(" ")
			? (interactionFiles.get(command.split(" ")[0]) as iInteractionFolder).files.get(
					command.split(" ")[1]
			  )!.help
			: (interactionFiles.get(command) as iInteractionFile).help

		embed.setAuthor(command, this.QUESTION)
		embed.setDescription(help.description)

		return {
			embeds: [embed],
			components: [
				new MessageActionRow().addComponents(this.createMenu()),
				new MessageActionRow().addComponents(button)
			]
		}
	}

	public createMenu(): MessageSelectMenu {
		const interactionFiles = this.getInteractionFiles()
		const menu = new MessageSelectMenu()
			.setCustomId("help-item")
			.setPlaceholder("Choose a command")

		for (const [entityName, entity] of interactionFiles) {
			if (Object.keys(entity).includes("files")) {
				for (const [fileName] of (entity as iInteractionFolder).files) {
					const name = `${entityName} ${fileName}`
					menu.addOptions({
						label: name,
						value: name
					})
				}
			} else {
				menu.addOptions({
					label: entityName,
					value: entityName
				})
			}
		}

		return menu
	}

	private getInteractionFiles() {
		const interactionFiles = new Collection<string, iInteractionFile | iInteractionFolder>()
		const [err, entitiyNames] = useTry(() =>
			fs.readdirSync(path.join(__dirname, "../commands"))
		)

		if (err) return interactionFiles

		// Slash subcommands
		const folderNames = entitiyNames.filter(f => !HelpBuilder.isFile(f))
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

			interactionFiles.set(folderName, {
				builder,
				files
			})
		}

		// Slash commands
		const fileNames = entitiyNames.filter(f => HelpBuilder.isFile(f))
		for (const filename of fileNames) {
			const file = require(`../commands/${filename}`) as iInteractionFile
			interactionFiles.set(file.builder.name, file)
		}

		return interactionFiles
	}

	private static isFile(file: string): boolean {
		return file.endsWith(".ts") || file.endsWith(".js")
	}
}

export default HelpBuilder
