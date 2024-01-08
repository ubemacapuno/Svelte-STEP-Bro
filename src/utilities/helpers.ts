type CallbackFunction = (...args: any[]) => any

export function debounce(func: CallbackFunction, timeout = 300) {
	let timer: number | undefined
	return (...args: any[]) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}
