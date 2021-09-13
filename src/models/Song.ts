import { raw as ytdl } from "youtube-dl-exec"
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice"
import ApiHelper from "../utilities/ApiHelper"

export default class Song {
	public title: string
	public artiste: string
	public cover: string
	public url: string
	public duration: number
	public requester: string

	public constructor(title: string, artiste: string, cover: string, url: string, duration: number, requester: string) {
		this.title = title
		this.artiste = artiste
		this.cover = cover
		this.url = url
		this.duration = duration
		this.requester = requester
	}

	public static async from(apiHelper: ApiHelper, url: string, requester: string) {
		const urlObject = new URL(url)
		if (urlObject.host === "open.spotify.com") {
			return await apiHelper.findSpotifySong(urlObject.pathname.slice(7), requester)
		} else {
			return await apiHelper.findYoutubeSong(url, requester)
		}
	}

	public createAudioResource(apiHelper: ApiHelper): Promise<AudioResource<Song>> {
		return new Promise(async (resolve, reject) => {
			let source = this.url
			const urlObject = new URL(source)
			if (urlObject.host === "open.spotify.com") {
				const youtubeResult = (await apiHelper.findYoutubeSong(`${this.title} ${this.artiste}`, this.requester))
				source = youtubeResult.url
			}

			const process = ytdl(
				source,
				{
					o: "-",
					q: "",
					f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
					r: "100K"
				},
				{ stdio: ["ignore", "pipe", "ignore"] }
			)
			if (!process.stdout) {
				reject(new Error("No stdout"))
				return
			}
			const stream = process.stdout
			const onError = (error: Error) => {
				if (!process.killed) process.kill()
				stream.resume()
				reject(error)
			}
			process
				.once("spawn", () => {
					demuxProbe(stream)
						.then((probe) => resolve(createAudioResource(probe.stream, {
							metadata: this,
							inputType: probe.type
						})))
						.catch(onError)
				})
				.catch(onError)
		})
	}
}