import { BaseButton, type ButtonHelper, type FilesSetupHelper, HelpBuilder } from "@framework"

export default class extends BaseButton {
	override defer = false
	override ephemeral = false

	override middleware = []

	constructor(public fsh: FilesSetupHelper) {
		super()
	}

	override async execute(helper: ButtonHelper) {
		helper.update(new HelpBuilder(this.fsh, helper.cache).buildMinimum())
	}
}
