import * as THREE from 'three'
import occtimportjs from 'occt-import-js'

/**
 * This file defines the LoadStep() function to import and visualize 3D geometries from STEP files using Three.js and occt-import-js.
 * 'wasmUrl' points to occt-import-js WebAssembly for initializing the open cascade technology (occt) module.
 * REPL @see https://codesandbox.io/p/sandbox/5nfq9t?file=%2Fsrc%2FApp.js
 */

const wasmUrl = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.wasm'

// Model HEX Colors
const defaultMeshColor = 0xf0f0f0

export async function LoadStep(input: string | File) {
	const targetObject = new THREE.Object3D()

	// Initialize occt-import-js
	const occt = await occtimportjs({
		locateFile: () => {
			return wasmUrl
		}
	})

	let buffer: ArrayBuffer

	// Determine if 'input' is a URL or a File
	if (typeof input === 'string') {
		// Handle as URL
		const response = await fetch(input)
		buffer = await response.arrayBuffer()
	} else if (input instanceof File) {
		// Handle as File
		buffer = await new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = (event) => {
				if (event.target?.result) {
					resolve(event.target.result as ArrayBuffer)
				} else {
					reject(new Error('FileReader did not load the file.'))
				}
			}
			reader.onerror = () => reject(new Error('File could not be read: ' + reader.error))
			reader.readAsArrayBuffer(input)
		})
	} else {
		throw new Error('Input must be a URL string or File.')
	}

	// Process the STEP file
	const fileBuffer = new Uint8Array(buffer)
	const result = occt.ReadStepFile(fileBuffer)

	// Process the geometries of the result
	for (const resultMesh of result.meshes) {
		const geometry = new THREE.BufferGeometry()

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3)
		)

		if (resultMesh.attributes.normal) {
			geometry.setAttribute(
				'normal',
				new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3)
			)
		}

		const index =
			resultMesh.index.array.length > 65535
				? Uint32Array.from(resultMesh.index.array)
				: Uint16Array.from(resultMesh.index.array)
		geometry.setIndex(new THREE.BufferAttribute(index, 1))

		let material: THREE.Material
		if (resultMesh.color) {
			const color = new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2])
			material = new THREE.MeshPhongMaterial({ color })
		} else {
			material = new THREE.MeshPhongMaterial({ color: defaultMeshColor })
		}

		const mesh = new THREE.Mesh(geometry, material)
		targetObject.add(mesh)
	}

	return targetObject
}
