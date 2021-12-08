import { BaseEntry } from "discordjs-nova"

export default interface Entry extends BaseEntry {
	prefix: string
	music_channel_id: string
	music_message_id: string
}
