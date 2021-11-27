import fs from "fs"
import path from "path"
import { Collection, MessageEmbed } from "discord.js"
import { iInteractionFile, iInteractionFolder, iInteractionSubcommandFile } from "./BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"
import { useTry } from "no-try"

class HelpBuilder {
	private readonly QUESTION =
		"https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/question.png?alt=media&token=fc6d0312-1ed2-408d-9309-5abe69c467c3"

	public constructor() {}

	public build(): MessageEmbed {
		const embed = new MessageEmbed()
		embed.setAuthor("Help", this.QUESTION)
		embed.setColor("#C7D1D8")
		embed.setDescription("This is the help section where you can see all the bot commands")

		for (const [entityName, entity] of this.getInteractionFiles()) {
			if (Object.keys(entity).includes("files")) {
				for (const [fileName, file] of (entity as iInteractionFolder).files) {
					embed.addField(`${entityName} ${fileName}`, file.builder.description)
				}
			} else {
				embed.addField(entityName, entity.builder.description)
			}
		}

		return embed
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
				builder: builder,
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
