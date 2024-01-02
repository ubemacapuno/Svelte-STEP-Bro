import * as THREE from 'three';
import occtimportjs from 'occt-import-js';

/**
 * Reference REPL @see https://codesandbox.io/p/sandbox/5nfq9t?file=%2Fsrc%2FApp.js
 */

const wasmUrl = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.wasm';

export async function LoadStep(fileUrl) {
	const targetObject = new THREE.Object3D();

	// init occt-import-js
	const occt = await occtimportjs({
		locateFile: (name) => {
			console.log('name', name);
			// return occtimportWasm
			return wasmUrl;
		}
	});

	const response = await fetch(fileUrl);
	const buffer = await response.arrayBuffer();

	// read the imported step file
	const fileBuffer = new Uint8Array(buffer);
	const result = occt.ReadStepFile(fileBuffer);

	// process the geometries of the result
	for (const resultMesh of result.meshes) {
		const geometry = new THREE.BufferGeometry();

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3)
		);
		if (resultMesh.attributes.normal) {
			geometry.setAttribute(
				'normal',
				new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3)
			);
		}
		const index = Uint16Array.from(resultMesh.index.array);
		geometry.setIndex(new THREE.BufferAttribute(index, 1));

		let material = null;
		if (resultMesh.color) {
			const color = new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2]);
			material = new THREE.MeshPhongMaterial({ color: color });
		} else {
			material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
		}

		const mesh = new THREE.Mesh(geometry, material);
		targetObject.add(mesh);
	}
	return targetObject;
}
