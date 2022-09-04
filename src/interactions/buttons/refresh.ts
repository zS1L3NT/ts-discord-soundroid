import { BaseButton, ButtonHelper } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"
import QueueBuilder from "../../utils/QueueBuilder"

export default class extends BaseButton<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<typeof prisma, Entry, GuildCache>) {
		helper.update(await new QueueBuilder(helper.cache, helper.member).build())
	}
}
