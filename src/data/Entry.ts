import { BaseEntry } from "nova-bot"

export default interface Entry extends BaseEntry {
	prefix: string
	music_channel_id: string
	music_message_id: string
	aliases: Record<string, string>
}
