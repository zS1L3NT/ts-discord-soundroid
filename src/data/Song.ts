import { exec } from "youtube-dl-exec"

import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice"

import logger from "../logger"
import ApiHelper from "../utilities/ApiHelper"
import MusicService, { StopStatus } from "./MusicService"

export default class Song {
	public constructor(
		public title: string,
		public artiste: string,
		public cover: string,
		public url: string,
		public duration: number,
		public requester: string
	) {}

	public static async from(apiHelper: ApiHelper, url: string, requester: string) {
		const _URL = new URL(url)
		if (_URL.host === "open.spotify.com") {
			return await apiHelper.findSpotifySong(_URL.pathname.slice(7), requester)
		} else {
			try {
				return await apiHelper.findYoutubeSong(url, requester)
			} catch {
				return await apiHelper.findYoutubeVideo(url, requester)
			}
		}
	}

	public createAudioResource(
		service: MusicService,
		apiHelper: ApiHelper
	): Promise<AudioResource<Song>> {
		return new Promise(async (resolve, reject) => {
			let source = this.url
			const _URL = new URL(source)
			if (_URL.host === "open.spotify.com") {
				const youtubeResult = await apiHelper.findYoutubeSong(
					`${this.title} ${this.artiste}`,
					this.requester
				)
				source = youtubeResult.url
			}

			const childProcess = exec(
				source,
				{
					limitRate: "10M",
					format: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
					output: "-"
				},
				{ stdio: ["ignore", "pipe"] }
			)
			const { stdout } = childProcess
			if (!stdout) {
				logger.error("No stduout from source")
				reject(new Error("[SOURCE>STDOUT]: No stduout from source"))
				return
			}

			childProcess
				.once("spawn", () => {
					demuxProbe(stdout)
						.then(probe =>
							resolve(
								createAudioResource(probe.stream, {
									metadata: this,
									inputType: probe.type
								})
							)
						)
						.catch(err => {
							if (!childProcess.killed) childProcess.kill()
							stdout.resume()

							err.message = `[SOURCE>DEMUXPROBE]: ` + err.message
							reject(err)

							service.stopStatus = StopStatus.KILLED
							logger.error("Source demuxprobe error", err)
						})
				})
				.catch(err => {
					// Crash => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// Skip => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// Normal => Command failed with exit code 1: ...

					if (!childProcess.killed) childProcess.kill()
					stdout.resume()

					if (err.message.startsWith("Command failed with ERR_STREAM_PREMATURE_CLOSE")) {
						logger.log("Abnormal stopping of track")
						if (service.stopStatus === StopStatus.INTENTIONAL) {
							logger.log("Track crash was intentional, nothing abnormal")
						} else if (service.stopStatus === StopStatus.RESTART) {
							logger.log("Player restarted, nothing abnormal")
						} else {
							service.stopStatus = StopStatus.KILLED
							err.message = `[SOURCE>PROCESS]: ` + err.message
							logger.warn("Track crashed, attempting to replay the track")
							reject(err)
						}
					}
				})
		})
	}
}
