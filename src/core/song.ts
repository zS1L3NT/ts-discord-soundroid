import { type AudioResource, createAudioResource, demuxProbe, } from "@discordjs/voice"

import logger from "../logger"
import type ApiHelper from "../utils/api-helper"
import type MusicService from "./music-service"
import { Transform } from "node:stream"

export default class Song {
	constructor(
		public title: string,
		public artiste: string,
		public cover: string,
		public url: string,
		public duration: number | null,
		public requester: string,
	) {}

	static async from(apiHelper: ApiHelper, url: string, requester: string) {
		const _URL = new URL(url)
		if (_URL.host === "open.spotify.com") {
			return await apiHelper.findSpotifySong(_URL.pathname.slice(7), requester)
		}

		try {
			return await apiHelper.findYoutubeSong(url, requester)
		} catch {
			return await apiHelper.findYoutubeVideo(url, requester)
		}
	}

	createAudioResource(service: MusicService, apiHelper: ApiHelper): Promise<AudioResource<Song>> {
		return new Promise((resolve, reject) =>
			(new URL(this.url).host === "open.spotify.com"
				? apiHelper
						.findYoutubeSong(`${this.title} ${this.artiste}`, this.requester)
						.then(res => res.url)
				: Promise.resolve(this.url)
			)
				.then(source => {
					const subprocess = Bun.spawn(
						["yt-dlp", source, "-f", "bestaudio", "-o", "-"],
						{
							onExit: (subprocess, exitCode, signalCode, error) => {
								console.log({ exitCode, signalCode, error })
							},
						},
					)

					const { stdout } = subprocess
					if (!stdout) {
						logger.error("No stdout from source")
						reject(new Error("[SOURCE>STDOUT]: No stdout from source"))
						return
					}

					const stream = new Transform()
					stdout.pipeTo(
						new WritableStream({
							write(value) {
								stream.push(value)
							},
							close() {
								stream.push(null)
							},
						}),
					)

					demuxProbe(stream).then(probe => {
						resolve(
							createAudioResource(probe.stream, {
								metadata: this,
								inputType: probe.type,
							}),
						)
					})

					// childProcess.once("spawn", () => {
					// 	demuxProbe(stdout)
					// 		.then(probe =>
					// 			resolve(
					// 				createAudioResource(probe.stream, {
					// 					metadata: this,
					// 					inputType: probe.type,
					// 				}),
					// 			),
					// 		)
					// 		.catch(err => {
					// 			if (!childProcess.killed) childProcess.kill()
					// 			stdout.resume()

					// 			err.message = `[SOURCE>DEMUXPROBE]: ${err.message}`
					// 			reject(err)

					// 			service.stopStatus = StopStatus.KILLED
					// 			logger.error("Source demuxprobe error", err)
					// 		})
					// })
					// .on("error", err => {
					// 	// Crash => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// 	// Skip => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// 	// Normal => Command failed with exit code 1: ...

					// 	if (!childProcess.killed) childProcess.kill()
					// 	stdout.resume()

					// 	if (
					// 		err.message.startsWith(
					// 			"Command failed with ERR_STREAM_PREMATURE_CLOSE",
					// 		)
					// 	) {
					// 		logger.log("Abnormal stopping of track")
					// 		if (service.stopStatus === StopStatus.INTENTIONAL) {
					// 			logger.log("Track crash was intentional, nothing abnormal")
					// 		} else if (service.stopStatus === StopStatus.RESTART) {
					// 			logger.log("Player restarted, nothing abnormal")
					// 		} else {
					// 			service.stopStatus = StopStatus.KILLED
					// 			err.message = `[SOURCE>PROCESS]: ${err.message}`
					// 			logger.warn("Track crashed, attempting to replay the track")
					// 			reject(err)
					// 		}
					// 	}
					// })
				})
				.catch(reject),
		)
	}
}
