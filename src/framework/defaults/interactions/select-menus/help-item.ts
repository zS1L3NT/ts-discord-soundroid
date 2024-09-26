import {
	BaseSelectMenu,
	type FilesSetupHelper,
	HelpBuilder,
	type SelectMenuHelper,
} from "@framework"

export default class extends BaseSelectMenu {
	override defer = false
	override ephemeral = false

	override middleware = []

	constructor(public fsh: FilesSetupHelper) {
		super()
	}

	override async execute(helper: SelectMenuHelper) {
		helper.update(new HelpBuilder(this.fsh, helper.cache).buildCommand(helper.value!))
	}
}
