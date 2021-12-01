import { BaseDocument } from "discordjs-nova"

export interface iValue {
	prefix: string
	music_channel_id: string
	music_message_id: string
}

export default class Document extends BaseDocument<iValue, Document> {
	public getEmpty() {
		return new Document({
			prefix: "",
			music_channel_id: "",
			music_message_id: ""
		})
	}
}
