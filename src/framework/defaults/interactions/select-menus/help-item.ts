import type { PrismaClient } from "@prisma/client"

import {
	type BaseBotCache,
	type BaseEntry,
	type BaseGuildCache,
	BaseSelectMenu,
	type FilesSetupHelper,
	HelpBuilder,
	type SelectMenuHelper,
} from "@framework"

export default class<
	P extends PrismaClient,
	E extends BaseEntry,
	GC extends BaseGuildCache<P, E, GC>,
	BC extends BaseBotCache<P, E, GC>,
> extends BaseSelectMenu<P, E, GC> {
	override defer = false
	override ephemeral = false

	override middleware = []

	constructor(public fsh: FilesSetupHelper<P, E, GC, BC>) {
		super()
	}

	override async execute(helper: SelectMenuHelper<P, E, GC>) {
		helper.update(new HelpBuilder(this.fsh, helper.cache).buildCommand(helper.value!))
	}
}
