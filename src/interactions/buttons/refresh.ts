import { BaseButton, type ButtonHelper } from "nova-bot"

import type { Entry } from "@prisma/client"

import type GuildCache from "../../data/GuildCache"
import type prisma from "../../prisma"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseButton<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<typeof prisma, Entry, GuildCache>) {
		helper.update(await new QueueBuilder(helper.cache, helper.member).build())
	}
}
