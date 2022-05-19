import { MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js"
import { CommandPayload } from "nova-bot"

export default class PageSelectBuilder {
	private currentPage = 0
	private maxPages = 0
	private startPage = 0
	private endPage = 0

	public constructor(
		private embed: MessageEmbed,
		private channelId: string,
		private messageId: string
	) {}

	public build(startPage?: number): CommandPayload {
		const pageInfo = this.embed.fields.find(field => field.name === `Page`)!.value
		const [pageStr, maxPagesStr] = pageInfo.split("/")
		this.currentPage = startPage || +pageStr!
		this.maxPages = +maxPagesStr!

		this.setStartPage()
		this.setEndPage()

		const pages = Array(this.endPage - this.startPage)
			.fill(0)
			.map((_, i) => i + this.startPage + 1)
			.map(page => ({
				label: `Page ${page}`,
				value: `${this.channelId}-${this.messageId}-${page}`
			}))

		if (this.allowPreviousPage()) {
			pages.splice(0, 0, {
				label: "Previous page",
				value: `${this.channelId}-${this.messageId}-more-${this.startPage - 20 + 1}`
			})
		}

		if (this.allowNextPage()) {
			pages.push({
				label: "Next page",
				value: `${this.channelId}-${this.messageId}-more-${this.endPage + 1}`
			})
		}

		return {
			embeds: [new MessageEmbed().setTitle(`Which page of the queue do you want to go to?`)],
			components: [
				new MessageActionRow().addComponents(
					new MessageSelectMenu().setCustomId("select-page").addOptions(pages)
				)
			]
		}
	}

	private setStartPage() {
		let startPage = Math.floor(this.currentPage / 20) * 20
		if (startPage === this.maxPages) {
			startPage -= 20
		}

		this.startPage = startPage
	}

	private setEndPage() {
		let endPage = this.startPage + 20
		if (endPage > this.maxPages) {
			endPage = this.maxPages
		}

		this.endPage = endPage
	}

	private allowNextPage(): boolean {
		return this.endPage !== this.maxPages
	}

	private allowPreviousPage(): boolean {
		return this.startPage !== 0
	}
}
