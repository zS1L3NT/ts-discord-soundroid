export interface iDocument {
	music_channel_id: string
	music_message_id: string
}

export default class Document {
	public value: iDocument

	public constructor(value: iDocument) {
		this.value = value
	}

	public static getEmpty(): Document {
		return new Document({
			music_channel_id: "",
			music_message_id: ""
		})
	}
}
