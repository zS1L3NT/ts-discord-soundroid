import ApiHelper from "../utilities/ApiHelper"
import GuildCache from "./GuildCache"
import MusicService, { StopStatus } from "./MusicService"
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice"
import { raw as ytdl } from "youtube-dl-exec"

export default class Song {
	public title: string
	public artiste: string
	public cover: string
	public url: string
	public duration: number
	public requester: string

	public constructor(
		title: string,
		artiste: string,
		cover: string,
		url: string,
		duration: number,
		requester: string
	) {
		this.title = title
		this.artiste = artiste
		this.cover = cover
		this.url = url
		this.duration = duration
		this.requester = requester
	}

	public static async from(apiHelper: ApiHelper, url: string, requester: string) {
		const URL_ = new URL(url)
		if (URL_.host === "open.spotify.com") {
			return await apiHelper.findSpotifySong(URL_.pathname.slice(7), requester)
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
			const URL_ = new URL(source)
			if (URL_.host === "open.spotify.com") {
				const youtubeResult = await apiHelper.findYoutubeSong(
					`${this.title} ${this.artiste}`,
					this.requester
				)
				source = youtubeResult.url
			}

			const childProcess = exec(
				source,
				{ format: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio", output: "-" },
				{ stdio: ["ignore", "pipe", "ignore"] }
			)
			const { stdout } = childProcess
			if (!stdout) {
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

							service.stop_status = StopStatus.KILLED
							console.warn("Source demuxprobe error")
						})
				})
				.catch(err => {
					// Crash => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// Skip => Command failed with ERR_STREAM_PREMATURE_CLOSE: ...
					// Normal => Command failed with exit code 1: ...

					if (!childProcess.killed) childProcess.kill()
					stdout.resume()

					if (err.message.startsWith("Command failed with ERR_STREAM_PREMATURE_CLOSE")) {
						if (service.stop_status !== StopStatus.SKIPPED) {
							service.stop_status = StopStatus.KILLED
							err.message = `[SOURCE>PROCESS]: ` + err.message
							reject(err)
						}
					}
				})
		})
	}
}
