export const trysync = <T, E extends Error>(fn: () => T): [T, null] | [null, E] => {
	try {
		return [fn(), null]
	} catch (e) {
		return [null, e as E]
	}
}

export const tryasync = async <T, E extends Error>(
	fn: () => Promise<T>,
): Promise<[T, null] | [null, E]> => {
	try {
		return [await fn(), null]
	} catch (e) {
		return [null, e as E]
	}
}
