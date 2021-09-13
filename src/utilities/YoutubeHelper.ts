import Song from "../models/Song"

export default class YoutubeHelper {
	private searchApi: any

	public constructor() {
		this.searchApi = new (require("youtube-music-api"))()
		this.searchApi.initalize()
	}

	public async search(query: string, limit: number = 10): Promise<Song[]> {
		const results = (await this.searchApi.search(query, "song")).content
		const songs: Song[] = results.map((result: any) => new Song(
				result.name,
				Array.isArray(result.artist) ? result.artist.map((a: any) => a.name).join(", ") : result.artist.name,
				result.thumbnails[result.thumbnails.length - 1].url,
				`https://youtu.be/${result.videoId}`
			))

		if (songs.length > limit) songs.length = limit
		return songs
	}

}