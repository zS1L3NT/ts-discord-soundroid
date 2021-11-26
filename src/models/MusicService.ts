import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus
} from "@discordjs/voice"
import EmbedResponse, { Emoji } from "../utilities/EmbedResponse"
import GuildCache from "./GuildCache"
import Song from "./Song"

const time = async (ms: number) => new Promise(res => setTimeout(res, ms))

export default class MusicService {
	public readonly connection: VoiceConnection
	public readonly player: AudioPlayer
	public readonly cache: GuildCache
	public disconnectTimeout: NodeJS.Timeout | null = null
	public queue: Song[]
	public queueLock = false
	public readyLock = false

	public loop = false
	public queue_loop = false

	public constructor(connection: VoiceConnection, cache: GuildCache) {
		this.connection = connection
		this.player = createAudioPlayer()
		this.cache = cache
		this.queue = []

		this.connection.on("stateChange", async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (
					newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
					newState.closeCode === 4014
				) {
					/*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
					try {
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 15_000)
						// Probably moved voice channel
					} catch {
						console.warn("[CONNECTION]: Bot didn't enter connecting state")
						this.destroy()
						// Probably removed from voice channel
					}
				} else if (this.connection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					console.warn(
						`[CONNECTION]: Reconnecting, attempt ${this.connection.rejoinAttempts + 1}`
					)
					await time((this.connection.rejoinAttempts + 1) * 5_000)
					this.connection.rejoin()
				} else {
					/*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					console.warn("[CONNECTION]: Disconnected after 5 attempts")
					this.destroy()
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				/*
					Once destroyed, stop the subscription
				*/
				this.destroy()
			} else if (
				!this.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting ||
					newState.status === VoiceConnectionStatus.Signalling)
			) {
				/*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
				this.readyLock = true
				try {
					await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000)
				} catch {
					if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
						this.destroy()
					}
				} finally {
					this.readyLock = false
				}
			}
		})

		this.player.on("stateChange", (oldState, newState) => {
			if (
				newState.status === AudioPlayerStatus.Idle &&
				oldState.status !== AudioPlayerStatus.Idle
			) {
				if (this.queue_loop) {
					const current = this.queue.shift()
					if (current) {
						this.queue.push(current)
					}
				} else if (this.loop) {
				} else {
					this.queue.shift()
				}
				void this.processQueue()
			}

			let icon = ""
			switch (newState.status) {
				case AudioPlayerStatus.Buffering:
				case AudioPlayerStatus.Idle:
					icon = "🕑"
					break
				case AudioPlayerStatus.Paused:
					icon = "⏸️"
					break
				case AudioPlayerStatus.Playing:
					icon = "🎵"
					break
			}

			const current = this.queue.at(0)
			if (current) {
				this.cache.setNickname(`${icon} ${current.title} - ${current.artiste}`.slice(0, 32))
			} else {
				this.cache.setNickname(`SounDroid Bot`)
			}
		})

		this.connection.subscribe(this.player)
	}

	public destroy() {
		if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
			this.connection.destroy()
		}
		this.cache.setNickname()
		this.cache.updateMusicChannel()
		delete this.cache.service
	}

	/**
	 * Adds a new Song to the queue.
	 *
	 * @param song The song to add to the queue
	 */
	public enqueue(song: Song) {
		this.queue.push(song)
		this.processQueue()
		this.cache.updateMusicChannel()
	}

	/**
	 * Attempts to play a Song from the queue
	 */
	private async processQueue(): Promise<void> {
		// If the queue is empty, locked (already being processed), or the audio player is already playing something, return
		if (
			this.queue.length === 0 ||
			this.queueLock ||
			this.player.state.status !== AudioPlayerStatus.Idle
		) {
			if (this.queue.length === 0) {
				if (this.disconnectTimeout) {
					clearTimeout(this.disconnectTimeout)
				}

				this.disconnectTimeout = setTimeout(() => {
					this.destroy()
				}, 15_000)
			}
			return
		}

		if (this.disconnectTimeout) {
			clearTimeout(this.disconnectTimeout)
		}

		// Lock the queue to guarantee safe access
		this.queueLock = true
		const song = this.queue[0]
		try {
			// Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
			const resource = await song.createAudioResource(this.cache.apiHelper)
			this.cache.updateMusicChannel()
			this.player.play(resource)
			this.queueLock = false
		} catch (error) {
			// If an error occurred, try the next item of the queue instead
			this.queueLock = false
			console.error("Error playing track:", error)
			return this.processQueue()
		}
	}
}
