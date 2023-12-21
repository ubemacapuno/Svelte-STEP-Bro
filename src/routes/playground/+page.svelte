<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let container;

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		camera.position.z = 5;

		function animate() {
			requestAnimationFrame(animate);
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			renderer.render(scene, camera);
		}

		animate();
	});
</script>

<div bind:this={container} class="canvas-container"></div>

<style>
	.canvas-container {
		width: 100%;
		height: 500px;
	}
</style>
