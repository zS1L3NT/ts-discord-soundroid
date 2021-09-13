import Song from "../models/Song"
import ytdl from "ytdl-core"

export default class YoutubeHelper {
	private searchApi: any

	public constructor() {
		this.searchApi = new (require("youtube-music-api"))()
		this.searchApi.initalize()
	}

	public async search(query: string, requester: string, limit: number = 10): Promise<Song[]> {
		const results = (await this.searchApi.search(query, "song")).content
		if (results.length > limit) results.length = limit

		const songs: Promise<Song>[] = results.map(async (result: any) => {
			let duration = 0
			if (limit === 1) {
				try {
					const info = await ytdl.getBasicInfo(result.videoId)
					duration = parseInt(info.videoDetails.lengthSeconds) || 0
				} catch {
				}
			}

			return new Song(
				result.name,
				Array.isArray(result.artist) ? result.artist.map((a: any) => a.name).join(", ") : result.artist.name,
				result.thumbnails[result.thumbnails.length - 1].url,
				`https://youtu.be/${result.videoId}`,
				duration,
				requester
			)
		})

		return await Promise.all(songs)
	}

}