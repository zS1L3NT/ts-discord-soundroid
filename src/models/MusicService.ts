import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus
} from "@discordjs/voice"
import Song from "./Song"
import ApiHelper from "../utilities/ApiHelper"

const time = async (ms: number) => new Promise(res => setTimeout(res, ms))

export default class MusicService {
	public readonly connection: VoiceConnection
	public readonly player: AudioPlayer
	public readonly apiHelper: ApiHelper
	public queue: Song[]
	public queueLock = false
	public readyLock = false

	public loop = false
	public queue_loop = false

	public constructor(connection: VoiceConnection, apiHelper: ApiHelper, destroy: () => void) {
		this.connection = connection
		this.player = createAudioPlayer()
		this.apiHelper = apiHelper
		this.queue = []

		this.connection.on("stateChange", async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
					/*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
					try {
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000)
						// Probably moved voice channel
					} catch {
						this.connection.destroy()
						destroy()
						// Probably removed from voice channel
					}
				}
				else if (this.connection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					await time((this.connection.rejoinAttempts + 1) * 5_000)
					this.connection.rejoin()
				}
				else {
					/*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					this.connection.destroy()
					destroy()
				}
			}
			else if (newState.status === VoiceConnectionStatus.Destroyed) {
				/*
					Once destroyed, stop the subscription
				*/
				destroy()
			}
			else if (
				!this.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
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
						this.connection.destroy()
						destroy()
					}
				} finally {
					this.readyLock = false
				}
			}
		})

		this.player.on("stateChange", (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
				if (this.queue_loop) {
					this.queue.push(this.queue.shift()!)
				}
				else if (this.loop) {

				}
				else {
					this.queue.shift()
				}
				void this.processQueue()
			}
		})

		this.connection.subscribe(this.player)
	}

	/**
	 * Adds a new Song to the queue.
	 *
	 * @param song The song to add to the queue
	 */
	public enqueue(song: Song) {
		this.queue.push(song)
		void this.processQueue()
	}

	/**
	 * Attempts to play a Song from the queue
	 */
	private async processQueue(): Promise<void> {
		// If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
		if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
			return
		}
		// Lock the queue to guarantee safe access
		this.queueLock = true

		const song = this.queue[0]
		try {
			// Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
			const resource = await song.createAudioResource(this.apiHelper)
			this.player.play(resource)
			this.queueLock = false
		} catch (error) {
			// If an error occurred, try the next item of the queue instead
			this.queueLock = false
			return this.processQueue()
		}
	}
}