import { raw as ytdl } from "youtube-dl-exec"
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice"
import YoutubeHelper from "../utilities/YoutubeHelper"

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

	public static async from(youtube: YoutubeHelper, url: string, requester: string) {
		return (await youtube.search(url, requester, 1))[0]
	}

	public createAudioResource(): Promise<AudioResource<Song>> {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				this.url,
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