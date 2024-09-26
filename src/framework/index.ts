import type { BaseMessageOptions } from "discord.js"

import NovaBot from "./core/nova-bot"

export { default as HelpBuilder } from "./builders/help-builder"
export { default as ResponseBuilder } from "./builders/response-builder"
export {
	default as SlashBuilder,
	iSlashData,
	iSlashOption,
	iSlashDefaultOption,
	iSlashStringOption,
	iSlashNumberOption,
} from "./builders/slash-builder"

export {
	ButtonHelper,
	ButtonMiddleware,
	default as BaseButton,
} from "./core/interactions/base-button"
export {
	CommandHelper,
	CommandMiddleware,
	CommandType,
	default as BaseCommand,
} from "./core/interactions/base-command"
export {
	default as BaseEvent,
	EventMiddleware,
} from "./core/interactions/base-event"
export {
	default as BaseModal,
	ModalHelper,
	ModalMiddleware,
} from "./core/interactions/base-modal"
export {
	default as BaseSelectMenu,
	SelectMenuHelper,
	SelectMenuMiddleware,
} from "./core/interactions/base-select-menu"

export { default as BaseBotCache, BotCacheClass } from "./core/base-bot-cache"
export { default as BaseGuildCache, GuildCacheClass } from "./core/base-guild-cache"
export { aliases } from "./tables"
export * from "./core/nova-bot"

export { default as IsAdminMiddleware } from "./defaults/middleware/is-admin-middleware"

export { default as ChannelCleaner } from "./utils/channel-cleaner"
export { default as DateHelper } from "./utils/date-helper"
export { default as EventSetupHelper } from "./core/setup/event-setup-helper"
export { default as FilesSetupHelper } from "./core/setup/files-setup-helper"
export { default as LogManager } from "./core/setup/log-manager"
export { default as SlashCommandDeployer } from "./core/setup/slash-command-deployer"
export { trysync, tryasync } from "./utils/try-catch"

export type CommandPayload = Pick<BaseMessageOptions, "embeds" | "components">

export default NovaBot
