import ApiHelper from "./ApiHelper"

export default class ConversionHelper {
	private apiHelper: ApiHelper
	private url: URL
	private requester: string

	constructor(apiHelper: ApiHelper, url: URL, requester: string) {
		this.apiHelper = apiHelper
		this.url = url
		this.requester = requester
	}

	public async getSongs() {
		switch (this.url.host) {
			case "open.spotify.com":
				return await this.handleSpotify()
			case "music.youtube.com":
			case "www.youtube.com":
				return await this.handleYoutube()
			case "youtu.be":
				return await this.handleYoutubeShort()
		}

		throw new Error("Error playing resource from url")
	}

	private async handleSpotify() {
		const [type, id] = this.url.pathname.split("/").slice(1)
		if (!id) throw new Error("Error playing item from Spotify url")

		switch (type) {
			case "playlist":
				try {
					return await this.apiHelper.findSpotifyPlaylist(id, 1, 100, this.requester)
				} catch (err) {
					throw new Error("Error playing playlist from Spotify url")
				}
			case "track":
				try {
					return [await this.apiHelper.findSpotifySong(id, this.requester)]
				} catch (err) {
					throw new Error("Error playing song from Spotify url")
				}
		}

		throw new Error("Could not find Spotify resource from url")
	}

	private async handleYoutube() {
		let id
		switch (this.url.pathname) {
			case "/playlist":
				id = this.url.searchParams.get("list")
				if (id) {
					try {
						return await this.apiHelper.findYoutubePlaylist(id, 1, 100, this.requester)
					} catch (err) {
						throw new Error("Error playing playlist from Youtube url")
					}
				}
				break
			case "/watch":
				id = this.url.searchParams.get("v")
				if (id) {
					try {
						return [await this.apiHelper.findYoutubeVideo(id, this.requester)]
					} catch (err) {
						throw new Error("Error playing song from Youtube url")
					}
				}
		}

		throw new Error("Could not find Youtube resource from url")
	}

	private async handleYoutubeShort() {
		try {
			return [
				await this.apiHelper.findYoutubeVideo(this.url.pathname.slice(1), this.requester)
			]
		} catch (err) {
			throw new Error("Error playing song from Youtube url")
		}
	}
}
