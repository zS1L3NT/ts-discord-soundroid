import axios from "axios"
import { useTry } from "no-try"
import SpotifyWebApi from "spotify-web-api-node"
import ytdl from "ytdl-core"
import YTMusic from "ytmusic-api"
import ytpl from "ytpl"

import Song from "../data/Song"
import logger from "../logger"

export default class ApiHelper {
	private ytmusic: YTMusic
	private spotify: SpotifyWebApi
	private genius: any

	constructor() {
		this.ytmusic = new YTMusic()
		this.ytmusic.initialize()
		this.spotify = new SpotifyWebApi({
			clientId: process.env.SPOTIFY__CLIENT_ID,
			clientSecret: process.env.SPOTIFY__CLIENT_SECRET,
			refreshToken: process.env.SPOTIFY__REFRESH_TOKEN
		})
		this.genius = new (require("node-genius-api"))(process.env.GENIUS__ACCESS_TOKEN)
	}

	async searchYoutubeSongs(query: string, requester: string) {
		const songs = await this.ytmusic.searchSongs(query)
		if (songs.length > 10) songs.length = 10

		return await Promise.all(
			songs.map(
				async result =>
					new Song(
						result.name,
						result.artists.map(a => a.name).join(", "),
						result.thumbnails.at(-1)?.url || "",
						`https://youtu.be/${result.videoId}`,
						result.duration,
						requester
					)
			)
		)
	}

	async findYoutubeSong(query: string, requester: string) {
		const song = (await this.ytmusic.searchSongs(query)).at(0)

		if (!song || !song.videoId) {
			if (!song) logger.alert!("No song found for query", { query })
			else if (!song.videoId) logger.alert!("No video id found for song", { song })
			throw new Error()
		}

		// Check if query is a URL
		if (!useTry(() => new URL(query))[0]) {
			const queryInfo = await ytdl.getBasicInfo(query)
			const resultInfo = await ytdl.getBasicInfo(song.videoId)
			if (resultInfo.videoDetails.videoId !== queryInfo.videoDetails.videoId) {
				throw new Error()
			}
		}

		return new Song(
			song.name,
			song.artists.map(a => a.name).join(", "),
			song.thumbnails.at(-1)?.url || "",
			`https://youtu.be/${song.videoId}`,
			song.duration,
			requester
		)
	}

	async searchYoutubeVideos(query: string, requester: string) {
		const videos = await this.ytmusic.searchVideos(query)
		return videos
			.map(
				video =>
					new Song(
						video.name,
						video.artists.map(a => a.name).join(", "),
						video.thumbnails.at(-1)?.url || "",
						`https://youtu.be/${video.videoId}`,
						video.duration,
						requester
					)
			)
			.slice(0, 10)
	}

	async findYoutubeVideo(url: string, requester: string) {
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

	async findYoutubePlaylistLength(playlistId: string) {
		return (await this.ytmusic.getPlaylist(playlistId)).videoCount
	}

	async findYoutubePlaylist(playlistId: string, start: number, end: number, requester: string) {
		const { items: videos } = await ytpl(playlistId, { limit: end })
		return videos
			.slice(start - 1)
			.map(
				video =>
					new Song(
						video.title,
						video.author.name,
						video.bestThumbnail.url || "",
						"https://youtu.be/" + video.id,
						video.durationSec || 0,
						requester
					)
			)
	}

	async refreshSpotifyToken() {
		const refreshResponse = (await this.spotify.refreshAccessToken()).body
		this.spotify.setAccessToken(refreshResponse.access_token)
		this.spotify.setRefreshToken(
			refreshResponse.refresh_token || process.env.SPOTIFY__REFRESH_TOKEN
		)
	}

	async findSpotifyPlaylistLength(playlistId: string) {
		await this.refreshSpotifyToken()
		return (await this.spotify.getPlaylist(playlistId)).body.tracks.total
	}

	async findSpotifyPlaylist(playlistId: string, start: number, end: number, requester: string) {
		await this.refreshSpotifyToken()

		const tracks: Song[] = []
		let left = end - start + 1
		let offset = start - 1

		while (left > 0) {
			const limit = left > 100 ? 100 : left

			const results = await this.spotify.getPlaylistTracks(playlistId, { limit, offset })
			tracks.push(
				...results.body.items
					.filter(i => i.track !== null)
					.map(i => i.track!)
					.map(
						result =>
							new Song(
								result.name,
								result.artists.map(a => a.name).join(", "),
								result.album.images[0]?.url || "",
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

	async findSpotifyAlbum(albumId: string, requester: string) {
		await this.refreshSpotifyToken()

		const { body: album } = await this.spotify.getAlbum(albumId)
		return album.tracks.items.map(
			result =>
				new Song(
					result.name,
					result.artists.map(a => a.name).join(", "),
					album.images[0]?.url || "",
					`https://open.spotify.com/track/${result.id}`,
					Math.floor(result.duration_ms / 1000),
					requester
				)
		)
	}

	async findSpotifySong(trackId: string, requester: string) {
		await this.refreshSpotifyToken()

		const result = (await this.spotify.getTrack(trackId)).body
		return new Song(
			result.name,
			result.artists.map(a => a.name).join(", "),
			result.album.images[0]?.url || "",
			`https://open.spotify.com/track/${trackId}`,
			Math.floor(result.duration_ms / 1000),
			requester
		)
	}

	async searchGeniusLyrics(query: string): Promise<
		{
			id: string
			title: string
			artiste: string
		}[]
	> {
		const results = await this.genius.search(query)
		return results
			.map((r: any) => r.result)
			.map((result: any) => ({
				id: `${result.id}`,
				title: result.title,
				artiste: result.artist_names
			}))
	}

	async findGeniusLyrics(
		id: string
	): Promise<{ title: string; artiste: string; cover: string; lyrics: string }> {
		const song = await this.genius.song(id)
		const html = (await axios.get<string>(`https://genius.com/songs/${id}`)).data

		const lyrics = html
			.match(/JSON\.parse\('(.*)'\)/)!
			.map(j => j.slice(12, -2))
			.map(j => j.replaceAll("\\\\", "\\"))
			.map(j => j.replaceAll('\\"', '"'))
			.map(j => j.replaceAll("\\'", "'"))
			.map(j => useTry(() => JSON.parse(j))[1])
			.filter(j => !!j)
			.at(0).songPage.lyricsData.body

		const getLyrics = (lyrics: any): string => {
			if (typeof lyrics === "string") {
				return lyrics
			}

			if ("children" in lyrics) {
				return lyrics.children.map(getLyrics).join("")
			}

			if ("tag" in lyrics && lyrics.tag === "br") {
				return "\n"
			}

			return ""
		}

		return {
			title: song.title,
			artiste: song.artist_names,
			cover: song.song_art_image_url,
			lyrics: getLyrics(lyrics)
				.replaceAll("\n\n", "\n")
				.replaceAll(/(\[.*\])/g, "\n`$1`")
		}
	}
}
