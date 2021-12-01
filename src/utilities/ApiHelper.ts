import Song from "../models/Song"
import SpotifyWebApi from "spotify-web-api-node"
import ytdl from "ytdl-core"
import ytpl from "ytpl"
import { YouTube } from "youtube-node"
import { useTry } from "no-try"

const config = require("../../config.json")

export default class ApiHelper {
	private youtubeMusicApi: any
	private youtubeVideoApi: YouTube
	private spotifyApi: SpotifyWebApi
	private geniusApi: any

	public constructor() {
		this.youtubeMusicApi = new (require("youtube-music-api"))()
		this.youtubeMusicApi.initalize()
		this.youtubeVideoApi = new YouTube()
		this.spotifyApi = new SpotifyWebApi(config.spotify)
		this.spotifyApi.setAccessToken(config.spotify.accessToken)
		this.geniusApi = new (require("node-genius-api"))(config.genius)
	}

	public async searchYoutubeSongs(query: string, requester: string): Promise<Song[]> {
		const results = (await this.youtubeMusicApi.search(query, "song")).content
		if (results.length > 10) results.length = 10

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

	// @ts-ignore
	public async searchYoutubeVideos(query: string, requester: string): Promise<Song> {}

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

	public async findYoutubePlaylistLength(playlistId: string): Promise<number> {
		return (await ytpl(playlistId)).estimatedItemCount
	}

	public async findYoutubePlaylist(
		playlistId: string,
		start: number,
		end: number,
		requester: string
		// @ts-ignore
	): Promise<Song[]> {}

	public async refreshSpotify() {
		const refresh_response = (await this.spotifyApi.refreshAccessToken()).body
		this.spotifyApi.setAccessToken(refresh_response.access_token)
		this.spotifyApi.setRefreshToken(
			refresh_response.refresh_token || config.spotify.refreshToken
		)
	}

	public async findSpotifyPlaylistLength(playlistId: string): Promise<number> {
		await this.refreshSpotify()
		return (await this.spotifyApi.getPlaylist(playlistId)).body.tracks.total
	}

	public async findSpotifyPlaylist(
		playlistId: string,
		start: number,
		end: number,
		requester: string
	): Promise<Song[]> {
		await this.refreshSpotify()

		const tracks: Song[] = []
		let left = end - start + 1
		let offset = start - 1

		while (left > 0) {
			const limit = left > 100 ? 100 : left

			const results = await this.spotifyApi.getPlaylistTracks(playlistId, { limit, offset })
			tracks.push(
				...results.body.items
					.map(i => i.track)
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
			)

			if (limit === 100) {
				left -= 100
				offset += 100
			} else {
				break
			}
		}

		return tracks
	}

	public async findSpotifySong(trackId: string, requester: string): Promise<Song> {
		await this.refreshSpotify()

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

	public async findGeniusLyrics(query: string): Promise<string> {
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

		const lyrics_str = lines.slice(1).join("\n")
		return lyrics_str.slice(0, 6000)
	}
}
