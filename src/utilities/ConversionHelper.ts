import Song from "../models/Song"
import ytdl from "ytdl-core"
import ytpl from "ytpl"
import ApiHelper from "./ApiHelper"

export default class ConversionHelper {
	private apiHelper: ApiHelper
	private url: URL

	constructor(apiHelper: ApiHelper, url: URL) {
		this.apiHelper = apiHelper
		this.url = url
	}

	public async getSongs() {
		(await ytpl(this.url.href)).estimatedItemCount
			.then(res => console.log(res.estimatedItemCount))
			.catch(() => console.log("YTPL ❌"))
	}
}

new ConversionHelper(
	new ApiHelper(),
	new URL("https://www.youtube.com/playlist?list=PL_4kaUaA0vJiWCAUmxnC1rrCCTAJPQIOY")
).getSongs()
