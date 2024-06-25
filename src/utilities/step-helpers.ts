import * as THREE from 'three'

export function cleanupMaterial(material: THREE.Material) {
	material.dispose()

	const textureProperties = [
		'map',
		'lightMap',
		'bumpMap',
		'normalMap',
		'specularMap',
		'envMap',
		'alphaMap',
		'aoMap',
		'displacementMap',
		'emissiveMap',
		'gradientMap',
		'metalnessMap',
		'roughnessMap',
		'transmissionMap',
		'opacityMap'
	]

	// loop and dispose of textures
	textureProperties.forEach((prop) => {
		const texture = (material as any)[prop] as THREE.Texture | undefined
		if (texture instanceof THREE.Texture) {
			texture.dispose()
		}
	})
}

// function to process a STEP file outside the main thread using a Web Worker
export function loadStepUsingWorker(fileData: ArrayBuffer): Promise<THREE.Object3D> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('./step-worker.ts', import.meta.url), { type: 'module' })

		worker.onmessage = ({ data }) => {
			if (data.error) {
				console.error('Error in Web Worker: ' + data.error)
				reject(new Error('Error in Web Worker: ' + data.error))
				return
			}

			const loader = new THREE.ObjectLoader()
			const scene = loader.parse(data.geometryData) // parse JSON to a Three.js object
			resolve(scene)
		}

		worker.onerror = (err) => {
			console.error('Worker error received: ', err)
			reject(new Error('Error in Web Worker: ' + err.message))
		}

		worker.postMessage({ fileData }) // Sending ArrayBuffer directly
	})
}

export function calculateSurfaceArea(model: THREE.Object3D): { mm2: number; in2: number } {
	let surfaceArea = 0

	model.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			const geometry = child.geometry as THREE.BufferGeometry
			const index = geometry.getIndex()
			const position = geometry.getAttribute('position')

			if (index && position) {
				for (let i = 0; i < index.count; i += 3) {
					const a = index.getX(i)
					const b = index.getX(i + 1)
					const c = index.getX(i + 2)

					const vA = new THREE.Vector3().fromBufferAttribute(position, a)
					const vB = new THREE.Vector3().fromBufferAttribute(position, b)
					const vC = new THREE.Vector3().fromBufferAttribute(position, c)

					surfaceArea += calculateTriangleArea(vA, vB, vC)
				}
			}
		}
	})

	// Conversion factor from square millimeters to square inches
	const MM2_TO_IN2 = 0.0015500031
	const surfaceAreaInInches = surfaceArea * MM2_TO_IN2

	return {
		mm2: surfaceArea,
		in2: surfaceAreaInInches
	}
}

function calculateTriangleArea(vA: THREE.Vector3, vB: THREE.Vector3, vC: THREE.Vector3): number {
	const edge1 = new THREE.Vector3().subVectors(vB, vA)
	const edge2 = new THREE.Vector3().subVectors(vC, vA)
	const cross = new THREE.Vector3().crossVectors(edge1, edge2)
	return 0.5 * cross.length()
}

export function calculateVolume(model: THREE.Object3D): { mm3: number; in3: number } {
	let volume = 0

	model.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			const geometry = child.geometry as THREE.BufferGeometry
			const index = geometry.getIndex()
			const position = geometry.getAttribute('position')

			if (index && position) {
				for (let i = 0; i < index.count; i += 3) {
					const a = index.getX(i)
					const b = index.getX(i + 1)
					const c = index.getX(i + 2)

					const vA = new THREE.Vector3().fromBufferAttribute(position, a)
					const vB = new THREE.Vector3().fromBufferAttribute(position, b)
					const vC = new THREE.Vector3().fromBufferAttribute(position, c)

					volume += signedVolumeOfTriangle(vA, vB, vC)
				}
			}
		}
	})

	const volumeInCubicMillimeters = Math.abs(volume) // Volume in cubic millimeters (mm³)
	const MM3_TO_IN3 = 0.0000610237
	const volumeInCubicInches = volumeInCubicMillimeters * MM3_TO_IN3

	return {
		mm3: volumeInCubicMillimeters,
		in3: volumeInCubicInches
	}
}

function signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): number {
	return p1.dot(p2.cross(p3)) / 6.0
}
