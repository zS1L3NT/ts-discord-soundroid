import { useTry } from "no-try"
import SpotifyWebApi from "spotify-web-api-node"
import ytdl from "ytdl-core"
import Song from "../models/Song"

const config = require("../../config.json")

export default class ApiHelper {
	private youtubeMusicApi: any
	private spotifyApi: SpotifyWebApi
	private geniusApi: any

	public constructor() {
		this.youtubeMusicApi = new (require("youtube-music-api"))()
		this.youtubeMusicApi.initalize()
		this.spotifyApi = new SpotifyWebApi(config.spotify)
		this.spotifyApi.setAccessToken(config.spotify.accessToken)
		this.geniusApi = new (require("node-genius-api"))(config.genius)
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

		const [err] = useTry(() => new URL(query))
		if (err) {
			try {
				const info = await ytdl.getBasicInfo(result.videoId)
				duration = parseInt(info.videoDetails.lengthSeconds) || 0
			} catch {}
		} else {
			const query_info = await ytdl.getBasicInfo(query)
			const result_info = await ytdl.getBasicInfo(result.videoId)
			duration = parseInt(result_info.videoDetails.lengthSeconds) || 0
			if (result_info.videoDetails.videoId !== query_info.videoDetails.videoId) {
				throw new Error()
			}
		}

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
		const refresh_response = (await this.spotifyApi.refreshAccessToken()).body
		this.spotifyApi.setAccessToken(refresh_response.access_token)
		this.spotifyApi.setRefreshToken(
			refresh_response.refresh_token || config.spotify.refreshToken
		)

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
		const refresh_response = (await this.spotifyApi.refreshAccessToken()).body
		this.spotifyApi.setAccessToken(refresh_response.access_token)
		this.spotifyApi.setRefreshToken(
			refresh_response.refresh_token || config.spotify.refreshToken
		)

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
		const song = (await this.geniusApi.search(query))[0]?.result
		if (!song) throw new Error("")

		const lyrics = (await this.geniusApi.lyrics(song.id)).slice(1) as {
			part: string
			content: string[]
		}[]
		const lines: string[] = []

		for (const lyric of lyrics) {
			lines.push(`\u200B`)
			lines.push(...lyric.content)
		}

		return lines.slice(1)
	}
}
