export default class DurationHelper {
	private duration: number

	public constructor(duration: number) {
		this.duration = duration
	}

	public format() {
		const minutes = `${Math.floor(this.duration / 60)}`
		const seconds = `${this.duration % 60}`

		if (this.duration >= 3600) {
			const hours = `${this.duration % 3600}`
			return `${hours.padStart(2, `0`)}:${minutes.padStart(2, `0`)}:${seconds.padStart(2, `0`)}`
		} else {
			return `${minutes.padStart(2, `0`)}:${seconds.padStart(2, `0`)}`
		}
	}

}