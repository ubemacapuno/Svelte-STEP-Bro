import * as THREE from 'three'
import occtimportjs from 'occt-import-js'

/**
 * This file is a Web Worker to process STEP files outside the main thread.
 * It uses occt-import-js and Three.js to process the STEP file into a Three.js object,
 * then serializes it to JSON to be sent to the main thread, where it will be reconstructed into a Three.js object.
 *
 * 'wasmUrl' points to occt-import-js WebAssembly for initializing the open cascade technology (occt) module.
 * REPL @see https://codesandbox.io/p/sandbox/5nfq9t?file=%2Fsrc%2FApp.js
 * GitHub Repo @see https://github.com/kovacsv/occt-import-js
 */

const wasmUrl = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.wasm'

// Model HEX Colors
const defaultMeshColor = 0xf0f0f0

const loadStep = async (fileBuffer: ArrayBuffer) => {
	try {
		// Initialize OCCT with the location of the wasm file
		const occt = await occtimportjs({
			locateFile: () => wasmUrl
		})

		// Ensure the buffer is valid and not empty
		if (!fileBuffer.byteLength) {
			throw new Error('Buffer is empty.')
		}

		// Convert the ArrayBuffer to a Uint8Array that OCCT can use
		const fileUint8Array = new Uint8Array(fileBuffer)

		// Process the STEP file
		const result = occt.ReadStepFile(fileUint8Array)
		if (!result || !result.meshes) {
			throw new Error('STEP file processing failed or no meshes found.')
		}

		// Construct the THREE.js Object3D from the results
		const targetObject = new THREE.Object3D()
		result.meshes.forEach((resultMesh) => {
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
					? new Uint32Array(resultMesh.index.array)
					: new Uint16Array(resultMesh.index.array)
			geometry.setIndex(new THREE.BufferAttribute(index, 1))

			const color = resultMesh.color
				? new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2])
				: new THREE.Color(defaultMeshColor)
			const material = new THREE.MeshPhongMaterial({ color })

			const mesh = new THREE.Mesh(geometry, material)
			targetObject.add(mesh)
		})

		return targetObject.toJSON() // Convert the Three.js object to JSON for postMessage
	} catch (error) {
		console.error('Error processing STEP file:', error)
		postMessage({ error: error.message })
	}
}

addEventListener('message', async ({ data }) => {
	const { fileData } = data // Use ArrayBuffer directly

	if (!fileData) {
		postMessage({ error: 'No file data received.' })
		return
	}

	try {
		const geometryData = await loadStep(fileData) // Adjust loadStep to handle ArrayBuffer
		if (!geometryData) {
			postMessage({ error: 'Failed to load STEP file.' })
			return
		}

		postMessage({ geometryData })
	} catch (error) {
		postMessage({ error: error.message })
	}
})
