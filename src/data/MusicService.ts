import {
	AudioPlayer, AudioPlayerStatus, createAudioPlayer, entersState, VoiceConnection,
	VoiceConnectionDisconnectReason, VoiceConnectionStatus
} from "@discordjs/voice"

import logger from "../logger"
import GuildCache from "./GuildCache"
import Song from "./Song"

const time = async (ms: number) => new Promise(res => setTimeout(res, ms))

export enum StopStatus {
	NORMAL,
	INTENTIONAL,
	RESTART,
	KILLED
}

export default class MusicService {
	readonly player: AudioPlayer
	disconnectTimeout: NodeJS.Timeout | null = null
	queue: Song[]
	queueLock = false
	readyLock = false

	stopStatus: StopStatus = StopStatus.NORMAL

	loop = false
	queueLoop = false

	constructor(public readonly connection: VoiceConnection, public readonly cache: GuildCache) {
		this.player = createAudioPlayer()
		this.queue = []

		this.connection.on<"stateChange">("stateChange", async (_, newState) => {
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
					logger.log("Connection didn't become ready in 20 seconds, destroying")
					if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
						this.destroy()
					}
				} finally {
					this.readyLock = false
				}
			}
		})

		this.player.on<"stateChange">("stateChange", async (oldState, newState) => {
			if (
				newState.status === AudioPlayerStatus.Idle &&
				oldState.status !== AudioPlayerStatus.Idle
			) {
				await time(500)
				if (this.stopStatus !== StopStatus.KILLED) {
					if (this.stopStatus === StopStatus.RESTART) {
						logger.log("Player restarted, replaying current song")
					} else if (this.queueLoop) {
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

	restart() {
		this.stopStatus = StopStatus.RESTART
		this.player.stop()
		this.processQueue()
		this.cache.setNickname()
		this.cache.updateMinutely()
	}

	destroy() {
		if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
			logger.log("Destroyed music service")
			this.connection.destroy()
		}
		this.cache.setNickname()
		this.cache.updateMinutely()
		delete this.cache.service
	}

	/**
	 * Adds a new Song to the queue.
	 *
	 * @param song The song to add to the queue
	 */
	enqueue(song: Song) {
		this.queue.push(song)
		this.processQueue()
		this.cache.updateMinutely()
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
				this.cache.updateMinutely()

				if (this.disconnectTimeout) {
					logger.log("Clearing previous disconnect timeout")
					clearTimeout(this.disconnectTimeout)
					this.cache.logger.log({
						title: `Stopped disconnect timer`,
						description: `A track was played within a minute of the disconnect timeout`,
						color: "GREY"
					})
				}

				logger.log("Nothing in queue, setting one minute disconnect timeout")
				this.cache.logger.log({
					title: `Waiting 1 minute before disconnecting`,
					description: `If nothing is playing, the bot will disconnect after 1 minute`,
					color: "GREY"
				})
				this.disconnectTimeout = setTimeout(() => {
					logger.log("One minute without anything in queue, disconnecting")
					this.destroy()
					this.cache.logger.log({
						title: `One minute without activity`,
						description: `No activity within a minute, destroying music service and disconnecting...`,
						color: "#000000"
					})
				}, 60_000)
			}
			return
		}

		if (this.disconnectTimeout) {
			logger.log("Clearing existing disconnect timeout")
			clearTimeout(this.disconnectTimeout)
			this.disconnectTimeout = null
			this.cache.logger.log({
				title: `Stopped disconnect timer`,
				description: `A track was played within a minute of the disconnect timeout`,
				color: "GREY"
			})
		}

		// Lock the queue to guarantee safe access
		this.queueLock = true
		const song = this.queue[0]!
		try {
			// Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
			const resource = await song.createAudioResource(this, this.cache.apiHelper)
			this.stopStatus = StopStatus.NORMAL
			this.cache.updateMinutely()
			this.player.play(resource)
			this.queueLock = false
		} catch (err) {
			// If an error occurred, try the next item of the queue instead
			this.queueLock = false
			logger.error("Error playing track", err)
			this.cache.logger.log({
				title: `Error playing track`,
				description: (err as Error).stack || "No stack trace available",
				color: "RED"
			})
			return this.processQueue()
		}
	}
}
