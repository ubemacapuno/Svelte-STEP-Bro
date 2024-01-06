<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { LoadStep } from '../utilities/StepLoader';
	import Loader from '$lib/components/Loader.svelte';

	type ModelSource = string | File;
	type CallbackFunction = (...args: any[]) => any;

	// THREEjs Vars:
	let container: HTMLElement | null = null;
	let model: THREE.Object3D | null;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;

	let isModelLoading = false;
	let isModelRendered: boolean = false;
	let fileName = '';
	let debouncedResize: (...args: any[]) => void;

	const demoUrl = '/demo.STEP';

	onMount(() => {
		// Initialize scene, camera, and renderer,
		// but make sure container and window exist first
		if (container && typeof window !== 'undefined') {
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

			renderer.setClearColor(0xd3d3d3);

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
			debouncedResize = debounce(onWindowResize, 1800);
			window.addEventListener('resize', debouncedResize);

			// Ensure initial sizing is correct
			onWindowResize();
		} else {
			console.error('Container and/or Window elements are undefined.');
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', debouncedResize);
		}
	});

	async function loadAndHandleModel(modelSource: ModelSource) {
		fileName = modelSource instanceof File ? modelSource.name : 'demo.STEP';
		isModelLoading = true;

		clearModel();
		model = await LoadStep(modelSource);

		if (model) {
			isModelRendered = true;
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
			camera.position.set(0, 50, 100); // Adjust as needed
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

	function clearModel() {
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
			isModelRendered = false;
		}
	}

	function debounce(func: CallbackFunction, timeout = 300) {
		let timer: number | undefined;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func.apply(this, args);
			}, timeout);
		};
	}

	function onWindowResize() {
		if (camera && renderer && container) {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		}
	}

	async function loadDemoFile() {
		await loadAndHandleModel(demoUrl); // Pass the URL to the new function
	}
</script>

<button on:click={loadDemoFile}>Load Demo</button>
<button on:click={clearModel}>Clear</button>

<div bind:this={container} class="canvas-container">
	{#if isModelLoading}
		<div class="canvas_center">
			<Loader />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="canvas_center flex">
			<span> Select a STEP file to view. </span>
			<input type="file" id="fileInput" accept=".step,.stp" on:change={handleFileChange} />
		</div>
	{/if}
</div>

<style>
	.canvas-container {
		outline: 1px solid black;
		width: 100%;
		height: 100%;
		position: relative;
	}
	.canvas_center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.flex {
		display: flex;
		flex-direction: column;
	}
</style>
