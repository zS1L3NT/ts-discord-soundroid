import type { BaseMessageOptions } from "discord.js"

import NovaBot from "./nova-bot"

export { default as BaseBotCache, iBaseBotCache } from "./core/base-bot-cache"
export { default as BaseEntry } from "./core/base-entry"
export { default as BaseGuildCache, iBaseGuildCache } from "./core/base-guild-cache"
export { default as HelpBuilder } from "./builders/help-builder"
export { default as ResponseBuilder } from "./builders/response-builder"
export { default as SlashBuilder } from "./builders/slash-builder"
export {
	ButtonHelper,
	ButtonMiddleware,
	default as BaseButton,
} from "./core/base-button"
export {
	CommandHelper,
	CommandMiddleware,
	CommandType,
	default as BaseCommand,
} from "./core/base-command"
export { default as BaseEvent, EventMiddleware } from "./core/base-event"
export { default as BaseModal, ModalHelper, ModalMiddleware } from "./core/base-modal"
export {
	default as BaseSelectMenu,
	SelectMenuHelper,
	SelectMenuMiddleware,
} from "./core/base-select-menu"
export { default as IsAdminMiddleware } from "./defaults/middleware/is-admin-middleware"
export * from "./nova-bot"
export { default as ChannelCleaner } from "./utils/channel-cleaner"
export { default as DateHelper } from "./utils/date-helper"
export { default as EventSetupHelper } from "./utils/event-setup-helper"
export { default as FilesSetupHelper } from "./utils/files-setup-helper"
export { default as LogManager } from "./utils/log-manager"
export { default as SlashCommandDeployer } from "./utils/slash-command-deployer"

export type CommandPayload = Pick<BaseMessageOptions, "embeds" | "components">

export interface iSlashData {
	description: string
	options?: (iSlashDefaultOption | iSlashStringOption | iSlashNumberOption)[]
}

export interface iSlashOption {
	name: string
	description: string
	requirements: string
	required: boolean
	default?: string
}

export interface iSlashDefaultOption extends iSlashOption {
	type: "boolean" | "user" | "role" | "channel" | "mentionable"
}

export interface iSlashStringOption extends iSlashOption {
	type: "string"
	choices?: {
		name: string
		value: string
	}[]
}

export interface iSlashNumberOption extends iSlashOption {
	type: "number"
	choices?: {
		name: string
		value: number
	}[]
}

export default NovaBot
