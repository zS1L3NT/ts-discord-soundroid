import fs from "node:fs"
import path from "node:path"
import { type ClientEvents, Collection } from "discord.js"

import type { PrismaClient } from "@prisma/client"

import {
	type BaseBotCache,
	type BaseButton,
	type BaseCommand,
	type BaseEntry,
	type BaseEvent,
	type BaseGuildCache,
	type BaseModal,
	type BaseSelectMenu,
	trysync,
} from "@framework"
import ButtonHelpMaximum from "../../defaults/interactions/buttons/help-maximum"
import ButtonHelpMinimum from "../../defaults/interactions/buttons/help-minimum"
import CommandHelp from "../../defaults/interactions/commands/help"
import CommandSetAlias from "../../defaults/interactions/commands/set-alias"
import CommandSetLogChannel from "../../defaults/interactions/commands/set-log-channel"
import CommandSetPrefix from "../../defaults/interactions/commands/set-prefix"
import EventGuildCreate from "../../defaults/interactions/events/guild-create"
import EventGuildDelete from "../../defaults/interactions/events/guild-delete"
import EventRoleUpdate from "../../defaults/interactions/events/role-update"
import SelectMenuHelpItem from "../../defaults/interactions/select-menus/help-item"

export default class FilesSetupHelper<
	P extends PrismaClient,
	E extends BaseEntry,
	GC extends BaseGuildCache<P, E, GC>,
	BC extends BaseBotCache<P, E, GC>,
> {
	readonly commandFiles = new Collection<string, BaseCommand<P, E, GC>>()
	readonly buttonFiles = new Collection<string, BaseButton<P, E, GC>>()
	readonly selectMenuFiles = new Collection<string, BaseSelectMenu<P, E, GC>>()
	readonly modalFiles = new Collection<string, BaseModal<P, E, GC>>()
	readonly eventFiles = new Collection<string, BaseEvent<P, E, GC, BC, keyof ClientEvents>>()

	constructor(
		public readonly directory: string,
		public readonly icon: string,
		public readonly helpMessage: (cache: GC) => string,
	) {
		this.setupCommands()
		this.setupButtons()
		this.setupSelectMenus()
		this.setupModals()
		this.setupEvents()
	}

	private readEntities(name: string) {
		const [files, ferror] = trysync(() => fs.readdirSync(path.join(this.directory, name)))
		if (ferror) return null
		return files
	}

	private require<T>(location: string): T {
		const file = require(path.join(this.directory, location))
		if ("default" in file) {
			return file.default
		}
		return file
	}

	private setupCommands() {
		this.commandFiles.set("help", new CommandHelp(this))
		this.commandFiles.set("set-alias", new CommandSetAlias(this.readEntities("messages") ?? []))
		this.commandFiles.set("set-log-channel", new CommandSetLogChannel())
		this.commandFiles.set("set-prefix", new CommandSetPrefix())

		const fileNames = this.readEntities("commands")
		if (fileNames === null) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]!
			const Command = this.require<new () => BaseCommand<P, E, GC>>(`commands/${fileName}`)
			this.commandFiles.set(name, new Command())
		}
	}

	private setupButtons() {
		this.buttonFiles.set("help-maximum", new ButtonHelpMaximum(this))
		this.buttonFiles.set("help-minimum", new ButtonHelpMinimum(this))

		const fileNames = this.readEntities("buttons")
		if (fileNames === null) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]!
			const Button = this.require<new () => BaseButton<P, E, GC>>(`buttons/${fileName}`)
			this.buttonFiles.set(name, new Button())
		}
	}

	private setupSelectMenus() {
		this.selectMenuFiles.set("help-item", new SelectMenuHelpItem(this))

		const fileNames = this.readEntities("selectMenus")
		if (fileNames === null) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]!
			const SelectMenu = this.require<new () => BaseSelectMenu<P, E, GC>>(
				`selectMenus/${fileName}`,
			)
			this.selectMenuFiles.set(name, new SelectMenu())
		}
	}

	private setupModals() {
		const fileNames = this.readEntities("modals")
		if (fileNames === null) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]!
			const Modal = this.require<new () => BaseModal<P, E, GC>>(`modals/${fileName}`)
			this.modalFiles.set(name, new Modal())
		}
	}

	private setupEvents() {
		this.eventFiles.set("guild-create", new EventGuildCreate(this))
		this.eventFiles.set("guild-delete", new EventGuildDelete<P, E, GC, BC>())
		this.eventFiles.set("role-update", new EventRoleUpdate<P, E, GC, BC>())

		const fileNames = this.readEntities("events")
		if (fileNames === null) return

		for (const fileName of fileNames) {
			const name = fileName.split(".")[0]!
			const Event = this.require<new () => BaseEvent<P, E, GC, BC, keyof ClientEvents>>(
				`events/${fileName}`,
			)
			this.eventFiles.set(name, new Event())
		}
	}
}
