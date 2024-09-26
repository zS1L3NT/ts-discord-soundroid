import { BaseCommand, type CommandHelper, type FilesSetupHelper, HelpBuilder } from "@framework"

export default class extends BaseCommand {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Shows you this help message",
	}

	override middleware = []

	constructor(public fsh: FilesSetupHelper) {
		super()
	}

	override condition(helper: CommandHelper) {
		return helper.isMessageCommand(false)
	}

	override converter() {}

	override async execute(helper: CommandHelper) {
		helper.respond(new HelpBuilder(this.fsh, helper.cache).buildMinimum(), null)
	}
}
