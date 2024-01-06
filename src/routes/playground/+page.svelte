<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { LoadStep } from '../../utilities/StepLoader';

	// THREEjs Vars:
	let container;
	let model: THREE.Object3D | null;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;

	let isModelLoading = false;
	let fileName = '';

	const demoUrl = '/demo01.stp';

	onMount(() => {
		// Initialize scene, camera, and renderer
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		renderer.setClearColor(0xffffff);

		// Add ambient light
		const ambientLight = new THREE.AmbientLight(0xffffff);
		scene.add(ambientLight);
		// Add directional light
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
		directionalLight.position.set(5, 5, 5);
		scene.add(directionalLight);

		// Initialize OrbitControls
		controls = new OrbitControls(camera, renderer.domElement);

		// Rendering loop
		function animate() {
			requestAnimationFrame(animate);
			if (controls) {
				controls.update();
			}
			renderer.render(scene, camera);
		}
		animate();
	});

	async function loadAndHandleModel(modelSource) {
		fileName = modelSource instanceof File ? modelSource.name : 'demo01.stp';
		isModelLoading = true;

		clearPreviousModel();
		model = await LoadStep(modelSource);

		if (model) {
			scene.add(model);
			const bbox = new THREE.Box3().setFromObject(model);
			const center = bbox.getCenter(new THREE.Vector3());
			model.position.sub(center); // Center the model

			// Create edge geometry from the mesh
			const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1 });
			model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					const edges = new THREE.EdgesGeometry(child.geometry);
					const edgeLine = new THREE.LineSegments(edges, edgeMaterial);
					child.add(edgeLine);
				}
			});

			// Adjust camera position and look at the center of the model
			camera.position.set(0, 50, 250); // Adjust as needed
			camera.lookAt(center);

			isModelLoading = false;
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			await loadAndHandleModel(input.files[0]); // Pass the file to the new function
		}
	}

	function clearPreviousModel() {
		if (model && scene) {
			scene.remove(model);
			model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.geometry.dispose();
					if (Array.isArray(child.material)) {
						child.material.forEach((material) => material.dispose());
					} else {
						child.material.dispose();
					}
				}
			});
		}
	}

	async function loadDemoFile() {
		await loadAndHandleModel(demoUrl); // Pass the URL to the new function
	}
</script>

<button on:click={loadDemoFile}>Load demo01.stp</button>

<input type="file" id="fileInput" accept=".step,.stp" on:change={handleFileChange} />
<div bind:this={container} class="canvas-container">
	{#if isModelLoading}
		<div class="loading">Loading...</div>
	{/if}
</div>

<style>
	.canvas-container {
		outline: 1px solid black;
		width: 100%;
		height: 95vh;
		position: relative;
	}
	.loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
