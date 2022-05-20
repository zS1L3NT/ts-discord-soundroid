import { BaseEntry } from "nova-bot"

export default interface Entry extends BaseEntry {
	music_channel_id: string
	music_message_id: string
}
