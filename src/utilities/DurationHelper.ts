export default class DurationHelper {
	private readonly duration: number

	public constructor(duration: number) {
		this.duration = Math.round(duration)
	}

	public format() {
		const seconds = `${this.duration % 60}`

		if (this.duration >= 3600) {
			const minutes = `${Math.floor(this.duration / 60) % 60}`
			const hours = `${Math.floor(this.duration / 3600)}`
			return `${hours.padStart(2, `0`)}:${minutes.padStart(2, `0`)}:${seconds.padStart(
				2,
				`0`
			)}`
		} else {
			const minutes = `${Math.floor(this.duration / 60)}`
			return `${minutes.padStart(2, `0`)}:${seconds.padStart(2, `0`)}`
		}
	}
}
