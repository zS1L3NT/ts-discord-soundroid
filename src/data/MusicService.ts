import GuildCache from "./GuildCache"
import Song from "./Song"
import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus
} from "@discordjs/voice"

const time = async (ms: number) => new Promise(res => setTimeout(res, ms))

export enum StopStatus {
	NORMAL,
	SKIPPED,
	KILLED
}

export default class MusicService {
	public readonly connection: VoiceConnection
	public readonly player: AudioPlayer
	public readonly cache: GuildCache
	public disconnectTimeout: NodeJS.Timeout | null = null
	public queue: Song[]
	public queue_lock = false
	public ready_lock = false

	public stop_status: StopStatus = StopStatus.NORMAL

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
						logger.alert!(
							"Bot didn't enter connecting state after 15, destroying session"
						)
						this.destroy()
						// Probably removed from voice channel
					}
				} else if (this.connection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					logger.alert!(`Reconnecting, attempt ${this.connection.rejoinAttempts + 1}`)
					await time((this.connection.rejoinAttempts + 1) * 5_000)
					this.connection.rejoin()
				} else {
					/*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					logger.alert!("Disconnected after 5 attempts")
					this.destroy()
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				/*
					Once destroyed, stop the subscription
				*/
				this.destroy()
			} else if (
				!this.ready_lock &&
				(newState.status === VoiceConnectionStatus.Connecting ||
					newState.status === VoiceConnectionStatus.Signalling)
			) {
				/*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
				this.ready_lock = true
				try {
					await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000)
				} catch {
					logger.log("Connection didn't become ready in 20 seconds, destroying")
					if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
						this.destroy()
					}
				} finally {
					this.ready_lock = false
				}
			}
		})

		this.player.on("stateChange", async (oldState, newState) => {
			if (
				newState.status === AudioPlayerStatus.Idle &&
				oldState.status !== AudioPlayerStatus.Idle
			) {
				await time(500)
				if (this.stop_status !== StopStatus.KILLED) {
					if (this.queue_loop) {
						const current = this.queue.shift()
						if (current) {
							logger.log("On queue loop, queueing current song")
							this.queue.push(current)
						} else {
							logger.log("On queue loop, no current song")
						}
					} else if (this.loop) {
						logger.log("On loop, replaying current song")
					} else {
						logger.log("Not looping, trying to play next song")
						this.queue.shift()
					}
				} else {
					logger.warn("Player killed, playing song again")
				}
				this.processQueue()
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
				this.cache.setNickname()
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
		logger.log("Destroyed music service")
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
			this.queue_lock ||
			this.player.state.status !== AudioPlayerStatus.Idle
		) {
			if (this.queue.length === 0) {
				if (this.disconnectTimeout) {
					logger.log("Clearing previous disconnect timeout")
					clearTimeout(this.disconnectTimeout)
				}

				logger.log("Nothing in queue, setting one minute disconnect timeout")
				this.disconnectTimeout = setTimeout(() => {
					logger.log("One minute without anything in queue, disconnecting")
					this.destroy()
				}, 60_000)
			}
			return
		}

		if (this.disconnectTimeout) {
			logger.log("Clearing existing disconnect timeout")
			clearTimeout(this.disconnectTimeout)
			this.disconnectTimeout = null
		}

		// Lock the queue to guarantee safe access
		this.queue_lock = true
		const song = this.queue[0]!
		try {
			// Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
			const resource = await song.createAudioResource(this, this.cache.apiHelper)
			this.stop_status = StopStatus.NORMAL
			this.cache.updateMusicChannel()
			this.player.play(resource)
			this.queue_lock = false
		} catch (err) {
			// If an error occurred, try the next item of the queue instead
			this.queue_lock = false
			logger.error("Error playing track", err)
			return this.processQueue()
		}
	}
}
