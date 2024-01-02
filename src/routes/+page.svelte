<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { LoadStep } from '../utilities/StepLoader';

	let container;
	let model;
	let scene, camera, renderer, controls;

	onMount(async () => {
		// Initialize scene, camera, and renderer
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		renderer.setClearColor(0xd9e7fc);

		// Load model
		console.log('Loading model...');
		model = await LoadStep('/plate-2.STEP');
		console.log('Model loaded:', model);

		if (model) {
			scene.add(model);
			const bbox = new THREE.Box3().setFromObject(model);
			const center = bbox.getCenter(new THREE.Vector3());
			model.position.sub(center); // Center the model

			// Adjust camera position and look at the center of the model
			camera.position.set(0, 50, 150); // Increase the z value to move the camera back
			camera.lookAt(center);
		}

		// Add lighting
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(5, 5, 5);
		scene.add(directionalLight);

		// Initialize OrbitControls
		controls = new OrbitControls(camera, renderer.domElement);

		// Rendering loop
		function animate() {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();
	});
</script>

<div bind:this={container} class="canvas-container"></div>

<style>
	.canvas-container {
		outline: 1px solid plum;
		width: 100%;
		height: 500px;
	}
</style>
