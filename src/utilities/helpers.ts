import * as THREE from 'three'

type CallbackFunction = (...args: any[]) => any
type OnWindowResizeParams = {
	camera: THREE.PerspectiveCamera
	renderer: THREE.WebGLRenderer
	container: HTMLElement | null
}

export function debounce(func: CallbackFunction, timeout = 300) {
	let timer: number | undefined
	return (...args: any[]) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}

export function onWindowResize({ camera, renderer, container }: OnWindowResizeParams) {
	if (camera && renderer && container) {
		camera.aspect = container.clientWidth / container.clientHeight
		camera.updateProjectionMatrix()
		renderer.setSize(container.clientWidth, container.clientHeight)
	}
}
