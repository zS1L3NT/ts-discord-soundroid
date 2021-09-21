import axios from "axios"
import SpotifyWebApi from "spotify-web-api-node"
import ytdl from "ytdl-core"
import Song from "../models/Song"

export default class ApiHelper {
	private youtubeMusicApi: any
	private spotifyApi: SpotifyWebApi

	public constructor() {
		this.youtubeMusicApi = new (require("youtube-music-api"))()
		this.youtubeMusicApi.initalize()
		this.spotifyApi = new SpotifyWebApi(JSON.parse(process.env.spotify!))
		this.spotifyApi.setAccessToken(JSON.parse(process.env.spotify!).accessToken)
	}

	public async searchYoutubeSongs(
		query: string,
		requester: string,
		limit: number = 10
	): Promise<Song[]> {
		const results = (await this.youtubeMusicApi.search(query, "song")).content
		if (results.length > limit) results.length = limit

		const songs: Promise<Song>[] = results.map(
			async (result: any) =>
				new Song(
					result.name,
					Array.isArray(result.artist)
						? result.artist.map((a: any) => a.name).join(", ")
						: result.artist.name,
					result.thumbnails.at(-1).url,
					`https://youtu.be/${result.videoId}`,
					0,
					requester
				)
		)

		return await Promise.all(songs)
	}

	public async findYoutubeSong(query: string, requester: string): Promise<Song> {
		const result = (await this.youtubeMusicApi.search(query, "song")).content[0]
		let duration = 0
		try {
			const info = await ytdl.getBasicInfo(result.videoId)
			duration = parseInt(info.videoDetails.lengthSeconds) || 0
		} catch {}

		return new Song(
			result.name,
			Array.isArray(result.artist)
				? result.artist.map((a: any) => a.name).join(", ")
				: result.artist.name,
			result.thumbnails.at(-1).url,
			`https://youtu.be/${result.videoId}`,
			duration,
			requester
		)
	}

	public async findYoutubeVideo(url: string, requester: string): Promise<Song> {
		const info = (await ytdl.getBasicInfo(url)).videoDetails
		return new Song(
			info.title,
			info.author.name,
			info.thumbnails.at(-1)?.url || "",
			info.video_url,
			parseInt(info.lengthSeconds) || 0,
			requester
		)
	}

	public async findSpotifyPlaylist(playlistId: string, requester: string): Promise<Song[]> {
		const accessToken = (await this.spotifyApi.refreshAccessToken()).body.access_token
		this.spotifyApi.setAccessToken(accessToken)

		const results = (await this.spotifyApi.getPlaylist(playlistId)).body.tracks.items.map(
			i => i.track
		)
		return results
			.filter(result => result !== null)
			.map(
				result =>
					new Song(
						result.name,
						result.artists.map(a => a.name).join(", "),
						result.album.images[0].url,
						`https://open.spotify.com/track/${result.id}`,
						Math.floor(result.duration_ms / 1000),
						requester
					)
			)
	}

	public async findSpotifySong(trackId: string, requester: string): Promise<Song> {
		const accessToken = (await this.spotifyApi.refreshAccessToken()).body.access_token
		this.spotifyApi.setAccessToken(accessToken)

		const result = (await this.spotifyApi.getTrack(trackId)).body
		return new Song(
			result.name,
			result.artists.map(a => a.name).join(", "),
			result.album.images[0].url,
			`https://open.spotify.com/track/${trackId}`,
			Math.floor(result.duration_ms / 1000),
			requester
		)
	}

	public async findGeniusLyrics(query: string): Promise<string[]> {
		return (await axios.get(`http://lyricserver.zectan.com/${encodeURIComponent(query)}`)).data
	}
}
