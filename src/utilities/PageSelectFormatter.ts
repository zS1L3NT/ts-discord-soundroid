import {
	InteractionReplyOptions,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu
} from "discord.js"

export default class PageSelectFormatter {
	private embed: MessageEmbed
	private channel_id: string
	private message_id: string

	private current_page = 0
	private max_pages = 0
	private start_page = 0
	private end_page = 0

	public constructor(embed: MessageEmbed, channel_id: string, message_id: string) {
		this.embed = embed
		this.channel_id = channel_id
		this.message_id = message_id
	}

	public getMessagePayload(start_page?: number): InteractionReplyOptions {
		const pageInfo = this.embed.fields.find(field => field.name === `Page`)!.value
		const [pageStr, maxPagesStr] = pageInfo.split("/")
		this.current_page = start_page || +pageStr
		this.max_pages = +maxPagesStr

		this.setStartPage()
		this.setEndPage()

		const pages = Array(this.end_page - this.start_page)
			.fill(0)
			.map((_, i) => i + this.start_page + 1)
			.map(page => ({
				label: `Page ${page}`,
				value: `${this.channel_id}-${this.message_id}-${page}`
			}))

		if (this.allowPreviousPage()) {
			pages.splice(0, 0, {
				label: "Previous page",
				value: `${this.channel_id}-${this.message_id}-more-${this.start_page - 20 + 1}`
			})
		}

		if (this.allowNextPage()) {
			pages.push({
				label: "Next page",
				value: `${this.channel_id}-${this.message_id}-more-${this.end_page + 1}`
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
		let start_page = Math.floor(this.current_page / 20) * 20
		if (start_page === this.max_pages) {
			start_page -= 20
		}

		this.start_page = start_page
	}

	private setEndPage() {
		let end_page = this.start_page + 20
		if (end_page > this.max_pages) {
			end_page = this.max_pages
		}

		this.end_page = end_page
	}

	private allowNextPage(): boolean {
		return this.end_page !== this.max_pages
	}

	private allowPreviousPage(): boolean {
		return this.start_page !== 0
	}
}
